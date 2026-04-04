import {
    Home,
    Info,
    BookOpen,
    Layout,
    Archive,
    Mail,
    FileText,
    Users,
    ShieldCheck,
    ScrollText,
    UserPlus
} from 'lucide-react';

export const navigation = [
    { name: 'Home', href: '/', icon: Home },
    {
        name: 'About',
        href: '/about',
        icon: Info,
        children: [
            { name: 'About the Journal', href: '/about', icon: Layout },
            { name: 'Publication Ethics', href: '/ethics', icon: ShieldCheck },
            { name: 'Peer Review Process', href: '/peer-review', icon: ScrollText },
            { name: 'Join Us', href: '/join-us', icon: UserPlus },
        ]
    },
    { name: 'Editorial Board', href: '/editorial-board', icon: Users },
    { name: 'Author Guidelines', href: '/guidelines', icon: FileText },
    {
        name: 'Publication',
        href: '#',
        icon: BookOpen,
        children: [
            { name: 'Current Issue', href: '/current-issue', icon: Layout },
            { name: 'Archive', href: '/archives', icon: Archive },
        ]
    },
    //{ name: 'Indexing', href: '/indexing', icon: Hash },
    { name: 'Contact Us', href: '/contact', icon: Mail },
];
