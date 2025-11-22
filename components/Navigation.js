import Link from 'next/link';
import DefisEnCoursBanner from './DefisEnCoursBanner';


const navLinks = [
    { href: '/profil', label: 'Profil' },
    { href: '/statistiques', label: 'Tableau de bord' },
];

const Navigation = () => {
    return (
        <>
            <nav
                style={{
                    background: '#fff',
                    borderRadius: 16,
                    boxShadow: '0 2px 16px 0 rgba(79,143,255,0.07)',
                    border: '1px solid #E3EAF2',
                    padding: '18px 0',
                    margin: '24px auto 32px auto',
                    maxWidth: 900,
                    display: 'flex',
                    justifyContent: 'center',
                }}
                aria-label="Navigation principale"
            >
                <ul
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '18px 32px',
                        listStyle: 'none',
                        margin: 0,
                        padding: 0,
                        alignItems: 'center',
                    }}
                >
                    {navLinks.map(link => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                style={{
                                    color: '#4F8FFF',
                                    fontWeight: 700,
                                    fontSize: '1.08em',
                                    textDecoration: 'none',
                                    padding: '7px 16px',
                                    borderRadius: 8,
                                    transition: 'background 0.18s, color 0.18s',
                                    fontFamily: 'Inter, Roboto, Arial, sans-serif',
                                    display: 'inline-block',
                                }}
                                onMouseOver={e => {
                                    e.target.style.background = '#F5F8FA';
                                    e.target.style.color = '#1976d2';
                                }}
                                onMouseOut={e => {
                                    e.target.style.background = 'none';
                                    e.target.style.color = '#4F8FFF';
                                }}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <DefisEnCoursBanner />
        </>
    );
};

export default Navigation;