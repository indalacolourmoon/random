"use client";

import { Users, UserPlus, Shield, Mail, Trash2, X, ShieldCheck, UserCog, MoreVertical, Plus, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { useUsers, useCreateUser, useDeleteUser } from '@/hooks/queries/useUsers';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

export default function UserManagement() {
    const { data: session } = useSession();
    const { data: users = [], isLoading: loading } = useUsers();
    const createUserMutation = useCreateUser();
    const deleteUserMutation = useDeleteUser();

    const [showAddModal, setShowAddModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    if (loading) return <div className="p-20 text-center font-semibold text-muted-foreground  tracking-widest text-xs animate-pulse ">Scanning Directory...</div>;

    const getRoleVariant = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-primary text-white border-none dark:bg-primary/20 dark:text-primary';
            case 'editor': return 'bg-blue-600/10 text-blue-600 border-none hover:bg-blue-600/20 dark:bg-blue-600/20 dark:text-blue-600';
            case 'reviewer': return 'bg-emerald-600/10 text-emerald-600 border-none hover:bg-emerald-600/20 dark:bg-emerald-600/20 dark:text-emerald-600';
            default: return 'bg-muted text-muted-foreground border-none';
        }
    };

    return (
        <section className="space-y-6">
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-primary/5 pb-8 2xl:pb-16 transition-all duration-500">
                <div className="space-y-1 2xl:space-y-2">
                    <h1 className="font-semibold text-foreground tracking-widest leading-none text-xl xl:text-2xl 2xl:text-4xl capitalize">Users & roles</h1>
                    <p className="text-[10px] xl:text-xs 2xl:text-base font-medium text-muted-foreground border-l-2 border-primary/10 pl-4 mt-2">Manage editorial staff, technical reviewers, and system archival access levels.</p>
                </div>
                <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                    <DialogTrigger asChild>
                        <Button className="h-10 xl:h-12 2xl:h-16 px-5 xl:px-6 2xl:px-10 gap-2.5 bg-primary text-white dark:text-slate-900 font-semibold text-[9px] xl:text-xs 2xl:text-base tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer capitalize">
                            <UserPlus className="w-4 h-4 2xl:w-6 2xl:h-6" /> Add staff member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-xl p-6 bg-card border-border/50">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-semibold text-foreground tracking-wider">Invite Staff Member</DialogTitle>
                            <DialogDescription className="text-sm font-semibold text-muted-foreground">
                                Access keys and credentials will be sent via email.
                            </DialogDescription>
                        </DialogHeader>
                        <form action={async (formData) => {
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
                        }} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="staff-fullName" className="text-[9px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground tracking-widest px-1 uppercase">Full Name</label>
                                <Input id="staff-fullName" name="fullName" required className="h-12 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30 font-semibold text-sm rounded-xl" placeholder="Dr. Jane Smith" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="staff-email" className="text-xs font-semibold text-muted-foreground tracking-widest px-1 uppercase">Email Address</label>
                                <Input id="staff-email" name="email" type="email" required className="h-12 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30 font-semibold text-sm rounded-xl" placeholder="jane@ijitest.com" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="staff-role" className="text-xs font-semibold text-muted-foreground tracking-widest px-1 uppercase">User Role</label>
                                <select id="staff-role" name="role" required className="flex h-12 w-full rounded-xl bg-muted/50 px-3 py-1 text-sm font-semibold transition-colors outline-none border-none ring-offset-background placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 text-foreground">
                                    <option value="reviewer">Reviewer (Expert witness)</option>
                                    <option value="editor">Editor (Decision-maker)</option>
                                    <option value="admin">Administrator (Architect)</option>
                                </select>
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="submit" className="w-full h-12 font-semibold text-xs tracking-widest shadow-xl shadow-primary/20 rounded-xl bg-primary text-white dark:text-black dark:text-slate-900 hover:bg-primary/90 cursor-pointer">
                                    Send Invitation
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </header>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 2xl:gap-8 transition-all duration-500">
                {users.length === 0 ? (
                    <div className="col-span-full py-20 bg-muted/20 border-2 border-dashed border-border/50 rounded-xl flex flex-col items-center justify-center text-center">
                        <Users className="w-10 h-10 text-muted-foreground/20 mb-4" />
                        <h3 className=" font-semibold text-muted-foreground tracking-wider">No Staff Found</h3>
                        <p className="text-[10px] font-medium text-muted-foreground  tracking-widest ">Start by adding your first team member.</p>
                    </div>
                ) : users.map((user) => (
                    <Card key={user.id} className="border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-all duration-300 border border-border/10 shrink-0 shadow-inner">
                                    <UserCog className="w-8 h-8" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-foreground tracking-wider truncate leading-none mb-2 transition-all duration-500 text-sm xl:text-base 2xl:text-xl">{user.full_name}</h3>
                                    <Badge className={`h-5 xl:h-6 2xl:h-8 px-2 xl:px-3 2xl:px-5 text-[9px] xl:text-xs 2xl:text-sm font-semibold tracking-widest border-none shadow-sm transition-all duration-500 capitalize ${getRoleVariant(user.role)}`}>
                                        {user.role}
                                    </Badge>
                                </div>
                                {user.role === 'admin' && (
                                    <div className="ml-auto opacity-20 group-hover:opacity-100 transition-opacity">
                                        <Shield className="w-4 h-4 text-emerald-600" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 mb-6 2xl:space-y-6">
                                <div className="flex items-center gap-3 text-[9px] xl:text-xs 2xl:text-sm font-semibold text-muted-foreground/80 truncate bg-muted/30 px-3 py-2 xl:px-4 xl:py-2.5 2xl:px-6 2xl:py-3.5 rounded-xl border border-border/5">
                                    <Mail className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 opacity-40 text-primary" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-[10px] 2xl:text-base font-semibold text-muted-foreground tracking-widest px-1">
                                    <ShieldCheck className="w-4 h-4 2xl:w-6 2xl:h-6 opacity-30" />
                                    <span>Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>

                            <Separator className="mb-4 opacity-50" />

                             <div className="pt-2 2xl:pt-6">
                                <p className="text-[9px] xl:text-xs 2xl:text-sm font-semibold text-muted-foreground capitalize tracking-widest mb-3 2xl:mb-6">Administrative controls</p>
                                <div className="flex items-center justify-between gap-4">
                                    <Badge variant="outline" className="text-[10px] 2xl:text-base font-mono font-semibold text-muted-foreground/50 tracking-widest bg-muted/20 border-border/20 px-2.5 py-1 2xl:px-4 2xl:py-2">
                                        ID-{String(user.id).padStart(3, '0')}
                                    </Badge>
                                    {session?.user && String((session.user as any).id) === String(user.id) ? (
                                        <Badge variant="outline" className="h-10 2xl:h-16 px-5 2xl:px-10 text-xs 2xl:text-lg font-semibold tracking-widest text-emerald-600 border-emerald-500/20 bg-emerald-500/5 rounded-xl uppercase flex items-center gap-2.5">
                                            <ShieldCheck className="w-4 h-4 2xl:w-6 2xl:h-6" /> My Active Session
                                        </Badge>
                                    ) : (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setUserToDelete(user)}
                                            className="h-10 2xl:h-16 px-5 2xl:px-10 gap-2.5 bg-rose-600 hover:bg-rose-700 text-white border-none rounded-xl 2xl:rounded-2xl transition-all text-xs 2xl:text-lg font-semibold uppercase tracking-widest shadow-lg shadow-rose-600/20 active:scale-95 cursor-pointer"
                                        >
                                            <Trash2 className="w-4.5 h-4.5 2xl:w-6 2xl:h-6" /> Delete Account
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <DialogContent className="sm:max-w-md rounded-xl p-6">
                    <DialogHeader className="space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive mb-2">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <DialogTitle className="text-xl font-semibold text-foreground tracking-wider">Revoke Staff Access?</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-muted-foreground leading-relaxed">
                            You are about to revoke system access for <span className="text-foreground font-semibold">{userToDelete?.full_name}</span>. This action will immediately invalidate their credentials and remove their administrative permissions.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-muted/30 p-5 rounded-xl border border-border/50 mb-2">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-background rounded-xl">
                                <Mail className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Account email</p>
                                <p className="text-sm font-semibold text-foreground truncate">{userToDelete?.email}</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setUserToDelete(null)}
                            disabled={isDeleting}
                            className="flex-1 h-11 text-[11px] font-semibold uppercase tracking-widest rounded-xl"
                        >
                            Maintain Access
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={async () => {
                                setIsDeleting(true);
                                try {
                                    const result = await deleteUserMutation.mutateAsync(userToDelete.id);
                                    if (result?.error) {
                                        toast.error(result.error);
                                    } else {
                                        toast.success("Staff access revoked");
                                        setUserToDelete(null);
                                    }
                                } catch (error) {
                                    toast.error("Failed to revoke staff access");
                                }
                                setIsDeleting(false);
                            }}
                            disabled={isDeleting}
                            className="flex-1 h-11 text-[11px] font-semibold uppercase tracking-widest rounded-xl shadow-lg shadow-destructive/20"
                        >
                            {isDeleting ? "Revoking..." : "Confirm Revocation"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Role Reference Guide */}
            <div className="mt-12 space-y-4">
                <div className="flex items-center gap-3 border-b border-border pb-3">
                    <h2 className="font-semibold text-foreground tracking-widest transition-all duration-500 text-xs xl:text-sm 2xl:text-lg capitalize">Role reference guide</h2>
                    <Info className="w-5 h-5 2xl:w-8 2xl:h-8 text-muted-foreground/30" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 2xl:gap-8 transition-all duration-500">
                    {[
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
                    ].map((guide) => (
                        <Card key={guide.role} className="border-border/50 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex flex-col gap-3 mb-5">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white dark:text-slate-900 shadow-lg ${guide.variant === 'primary' ? 'bg-primary shadow-primary/20' : guide.variant === 'blue' ? 'bg-blue-600 shadow-blue-600/20' : 'bg-emerald-600 shadow-emerald-600/20'}`}>
                                        {guide.role === 'Admin' ? <Shield className="w-6 h-6" /> : guide.role === 'Editor' ? <UserCog className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground tracking-wider ">{guide.role} <span className="text-[11px] text-muted-foreground font-semibold uppercase block mt-1">{guide.title}</span></h3>
                                    </div>
                                </div>
                                <p className="text-sm font-semibold text-muted-foreground leading-relaxed mb-6">{guide.desc}</p>
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

                 <div className="border border-border/50 rounded-xl 2xl:rounded-[2rem] overflow-hidden mt-6 shadow-sm overflow-x-auto">
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
                            {[
                                { role: 'Admin', focus: 'Infrastructure', publish: true, staff: true },
                                { role: 'Editor', focus: 'Workflow', publish: true, staff: false },
                                { role: 'Reviewer', focus: 'Accuracy', publish: false, staff: false },
                            ].map((row) => (
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
