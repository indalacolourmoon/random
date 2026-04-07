"use client";

import { Users, UserPlus, Shield, Mail, Trash2, ShieldCheck, UserCog, Info, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import { useUsers, useCreateUser, useDeleteUser, useUpdateUserRole } from '@/hooks/queries/useUsers';
import { useSession } from 'next-auth/react';
import React, { useState, useTransition, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { runCleanupInactiveAuthors } from '@/actions/author-submissions';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

const getRoleVariant = (role: string) => {
    switch (role) {
        case 'admin': return 'bg-primary text-white border-none dark:bg-primary/20 dark:text-primary';
        case 'editor': return 'bg-blue-600/10 text-blue-600 border-none hover:bg-blue-600/20 dark:bg-blue-600/20 dark:text-blue-600';
        case 'reviewer': return 'bg-emerald-600/10 text-emerald-600 border-none hover:bg-emerald-600/20 dark:bg-emerald-600/20 dark:text-emerald-600';
        default: return 'bg-muted text-muted-foreground border-none';
    }
};

const ROLE_GUIDE_DATA = [
    {
        role: 'Admin',
        title: 'The Architect',
        desc: 'Configuration and system oversight.',
        variant: 'primary',
        actions: ['Creating accounts', 'Site security', 'Metadata (ISSN)', 'Bug fixing']
    },
    {
        role: 'Editor',
        title: 'The Decision-Maker',
        desc: 'Content Flow & Life Cycle management.',
        variant: 'blue',
        actions: ['Screening', 'Assigning reviewers', 'Final decisions', 'Scheduling releases']
    },
    {
        role: 'Reviewer',
        title: 'The Expert Witness',
        desc: 'Technical evaluation & control.',
        variant: 'emerald',
        actions: ['Reading manuscripts', 'Error/Plagiarism check', 'Providing advice']
    }
] as const;

const PERMISSIONS_TABLE_DATA = [
    { role: 'Admin', focus: 'Infrastructure', publish: true, staff: true },
    { role: 'Editor', focus: 'Workflow', publish: true, staff: false },
    { role: 'Reviewer', focus: 'Accuracy', publish: false, staff: false },
] as const;

const UserItemCard = React.memo(({ user, currentUserId, onDelete, onUpdateRole }: { user: any, currentUserId: string | null, onDelete: (user: any) => void, onUpdateRole: (userId: string, newRole: any) => void }) => {
    const isEditingSelf = currentUserId === String(user.id);
    
    return (
        <Card key={user.id} className="border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden bg-card rounded-2xl">
            <CardContent className="p-8">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0 shadow-sm">
                        <UserCog className="w-8 h-8" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="truncate mb-3">
                            {user.profile?.fullName || 'No Name'}
                        </h3>
                        <Badge className={`h-7 px-4 text-[10px] font-bold tracking-widest border-none transition-all uppercase ${getRoleVariant(user.role)}`}>
                            {user.role}
                        </Badge>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground bg-muted/30 px-4 py-3 rounded-xl border border-border/50">
                        <Mail className="w-4 h-4 text-primary" />
                        <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground px-1">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <span>Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'}</span>
                    </div>
                </div>

                <div className="pt-5 border-t border-border/50">
                    <p className="mb-4 text-sm text-muted-foreground">Actions</p>
                    <div className="flex flex-col gap-3">
                        {isEditingSelf ? (
                            <Badge className="h-14 w-full justify-center px-8 text-xs font-bold tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl uppercase flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5" /> Active Managed Session
                            </Badge>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="h-10 gap-2 border-border bg-card text-foreground hover:bg-muted font-medium text-xs rounded-xl transition-all cursor-pointer"
                                        >
                                            <UserCog className="w-4 h-4" /> Change role
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md rounded-2xl p-10 bg-card">
                                        <DialogHeader className="space-y-3">
                                            <DialogTitle>Change role</DialogTitle>
                                            <DialogDescription className="text-sm text-muted-foreground">
                                                Change the role for <span className="text-foreground font-semibold">{user.profile?.fullName}</span>.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-6 space-y-3">
                                            <label className="text-xs font-medium text-muted-foreground">Select role</label>
                                            <select 
                                                title="Select Role"
                                                defaultValue={user.role}
                                                onChange={(e) => onUpdateRole(user.id, e.target.value as any)}
                                                className="w-full h-11 bg-muted/50 border-border/50 rounded-xl px-4 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/10"
                                            >
                                                <option value="reviewer">Reviewer</option>
                                                <option value="editor">Editor</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <Button
                                    variant="destructive"
                                    onClick={() => onDelete(user)}
                                    className="h-10 gap-2 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs rounded-xl cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" /> Remove
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});
UserItemCard.displayName = 'UserItemCard';

export default function UserManagement() {
    const { data: session } = useSession();
    const { data: users = [], isLoading: loading } = useUsers();
    const createUserMutation = useCreateUser();
    const deleteUserMutation = useDeleteUser();
    const updateRoleMutation = useUpdateUserRole();

    const [showAddModal, setShowAddModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCleaning, startCleanup] = useTransition();

    const currentUserId = useMemo(() => session?.user ? String((session.user as any).id) : null, [session]);

    const handleCleanup = useCallback(() => {
        startCleanup(async () => {
            try {
                const result = await runCleanupInactiveAuthors();
                if (result.success) {
                    toast.success(`Cleanup complete. Deleted ${result.data?.deletedCount || 0} inactive authors.`);
                } else {
                    toast.error(result.error || "Failed to perform cleanup");
                }
            } catch (error) {
                toast.error("An unexpected error occurred during cleanup");
            }
        });
    }, []);

    const handleCreateUser = useCallback(async (formData: FormData) => {
        try {
            const result = await createUserMutation.mutateAsync(formData);
            if (result.success) {
                setShowAddModal(false);
                toast.success("Staff member invited successfully");
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Failed to invite staff member");
        }
    }, [createUserMutation]);

    const handleUpdateRole = useCallback(async (userId: string, role: any) => {
        const toastId = toast.loading('Synchronizing role update...');
        try {
            const result = await updateRoleMutation.mutateAsync({ userId, role });
            if (result.success) {
                toast.success("Designation updated successfully", { id: toastId });
            } else {
                toast.error(result.error || "Execution fault", { id: toastId });
            }
        } catch (error) {
            toast.error("Internal system error", { id: toastId });
        }
    }, [updateRoleMutation]);

    const handleSetUserToDelete = useCallback((user: any) => {
        setUserToDelete(user);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        try {
            const result = await deleteUserMutation.mutateAsync(userToDelete.id);
            if (result.success) {
                toast.success("Staff member removed successfully");
                setUserToDelete(null);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Failed to revoke access");
        } finally {
            setIsDeleting(false);
        }
    }, [deleteUserMutation, userToDelete]);

    if (loading) return <div className="p-20 text-center font-semibold text-muted-foreground  tracking-widest text-xs animate-pulse ">Scanning Directory...</div>;

    return (
        <section className="space-y-6">
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border/50 pb-8">
                <div className="space-y-2">
                    <h1>Users & roles</h1>
                    <p className="max-w-2xl">Manage editorial staff and reviewers.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <Button 
                        variant="outline" 
                        onClick={handleCleanup}
                        disabled={isCleaning}
                        className="h-10 px-4 gap-2 border-amber-500/20 text-amber-600 hover:bg-amber-500/5 font-medium text-xs rounded-xl transition-all cursor-pointer"
                    >
                        <ShieldAlert className="w-4 h-4" /> 
                        {isCleaning ? "Cleaning..." : "Cleanup inactive authors"}
                    </Button>
                    <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                        <DialogTrigger asChild>
                            <Button className="h-10 px-5 gap-2 bg-primary text-white font-medium text-xs rounded-xl hover:bg-primary/90 transition-all cursor-pointer">
                                <UserPlus className="w-4 h-4" /> Add staff
                            </Button>
                        </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-xl p-6 bg-card border-border/50">
                        <DialogHeader>
                            <DialogTitle>Invite staff member</DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                                An invitation email will be sent with setup instructions.
                            </DialogDescription>
                        </DialogHeader>
                        <form action={handleCreateUser} className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="staff-fullName" className="text-xs font-medium text-muted-foreground">Full name</label>
                                <Input id="staff-fullName" name="fullName" required className="h-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30 text-sm rounded-xl" placeholder="Dr. Jane Smith" />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="staff-email" className="text-xs font-medium text-muted-foreground">Email</label>
                                <Input id="staff-email" name="email" type="email" required className="h-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30 text-sm rounded-xl" placeholder="jane@ijitest.com" />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="staff-role" className="text-xs font-medium text-muted-foreground">Role</label>
                                <select id="staff-role" name="role" required className="flex h-10 w-full rounded-xl bg-muted/50 px-3 py-1 text-sm transition-colors outline-none border-none ring-offset-background focus:ring-1 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 text-foreground">
                                    <option value="reviewer">Reviewer</option>
                                    <option value="editor">Editor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <DialogFooter className="pt-2">
                                <Button type="submit" className="w-full h-10 font-medium text-sm rounded-xl bg-primary text-white hover:bg-primary/90 cursor-pointer">
                                    Send invite
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                </div>
            </header>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 2xl:gap-8 transition-all duration-500">
                {users.length === 0 ? (
                    <div className="col-span-full py-20 bg-muted/20 border-2 border-dashed border-border/50 rounded-xl flex flex-col items-center justify-center text-center">
                        <Users className="w-10 h-10 text-muted-foreground/20 mb-4" />
                        <h3>No Staff Found</h3>
                        <p>Start by adding your first team member.</p>
                    </div>
                ) : users.map((user) => (
                    <UserItemCard
                        key={user.id}
                        user={user}
                        currentUserId={currentUserId}
                        onDelete={handleSetUserToDelete}
                        onUpdateRole={handleUpdateRole}
                    />
                ))}
            </div>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <DialogContent className="sm:max-w-md rounded-xl p-6">
                    <DialogHeader className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive mb-2">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <DialogTitle>Remove this user?</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                            This will remove <span className="text-foreground font-semibold">{userToDelete?.profile?.fullName || 'this user'}</span> and revoke their access. Any review assignments will also be cleared.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50 mb-2">
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="text-sm font-medium text-foreground truncate">{userToDelete?.email}</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-3">
                        <Button
                            variant="outline"
                            onClick={() => setUserToDelete(null)}
                            disabled={isDeleting}
                            className="flex-1 h-10 text-sm font-medium rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="flex-1 h-10 text-sm font-medium rounded-xl"
                        >
                            {isDeleting ? "Removing..." : "Remove"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Role Reference Guide */}
            <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 border-b border-border pb-3">
                    <h2>Role overview</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 2xl:gap-8 transition-all duration-500">
                    {ROLE_GUIDE_DATA.map((guide) => (
                        <Card key={guide.role} className="border-border/50 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex flex-col gap-3 mb-5">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white dark:text-slate-900 shadow-lg ${guide.variant === 'primary' ? 'bg-primary shadow-primary/20' : guide.variant === 'blue' ? 'bg-blue-600 shadow-blue-600/20' : 'bg-emerald-600 shadow-emerald-600/20'}`}>
                                        {guide.role === 'Admin' ? <Shield className="w-6 h-6" /> : guide.role === 'Editor' ? <UserCog className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3>{guide.role} <span className="text-xs opacity-60 block mt-1">{guide.title}</span></h3>
                                    </div>
                                </div>
                                <p className="mb-6">{guide.desc}</p>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-semibold text-muted-foreground/50 tracking-widest mb-3 uppercase">Key Actions</p>
                                    {guide.actions.map((action, i) => (
                                        <div key={i} className="flex items-center gap-3 text-xs font-semibold text-foreground bg-muted/30 px-3 py-2 rounded-xl">
                                            <CheckCircle className={`w-4 h-4 ${guide.variant === 'primary' ? 'text-primary' : guide.variant === 'blue' ? 'text-blue-600' : 'text-emerald-600'}`} />
                                            {action}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                 <div className="border border-border/50 rounded-xl 2xl:rounded-4xl overflow-hidden mt-6 shadow-sm overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-border/50">
                                <TableHead className="h-10 2xl:h-20 px-6 2xl:px-10 text-[10px] 2xl:text-lg font-semibold text-muted-foreground  tracking-widest">Level</TableHead>
                                <TableHead className="h-10 2xl:h-20 px-6 2xl:px-10 text-[10px] 2xl:text-lg font-semibold text-muted-foreground  tracking-widest">Focus</TableHead>
                                <TableHead className="h-10 2xl:h-20 px-6 2xl:px-10 text-[10px] 2xl:text-lg font-semibold text-muted-foreground  tracking-widest text-center">Publish?</TableHead>
                                <TableHead className="h-10 2xl:h-20 px-6 2xl:px-10 text-[10px] 2xl:text-lg font-semibold text-muted-foreground  tracking-widest text-center">Manage Staff?</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {PERMISSIONS_TABLE_DATA.map((row) => (
                                <TableRow key={row.role} className="border-border/50 hover:bg-muted/20 transition-colors">
                                    <TableCell className="px-6 py-4 2xl:px-10 2xl:py-8 font-semibold text-sm 2xl:text-2xl text-foreground">{row.role}</TableCell>
                                    <TableCell className="px-6 py-4 2xl:px-10 2xl:py-8 text-xs 2xl:text-xl font-semibold text-muted-foreground uppercase">{row.focus}</TableCell>
                                    <TableCell className="px-6 py-4 2xl:px-10 2xl:py-8 text-center">
                                        <div className={`w-2.5 h-2.5 2xl:w-5 2xl:h-5 rounded-full mx-auto ${row.publish ? 'bg-emerald-500' : 'bg-muted'}`} />
                                    </TableCell>
                                    <TableCell className="px-6 py-4 2xl:px-10 2xl:py-8 text-center">
                                        <div className={`w-2.5 h-2.5 2xl:w-5 2xl:h-5 rounded-full mx-auto ${row.staff ? 'bg-emerald-500' : 'bg-muted'}`} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </section >
    );
}
