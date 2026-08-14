import { useState, useEffect } from 'react';
import { SupabaseProvider, supabase } from '../lib/supabaseClient';
import { AuthProvider } from '../contexts/AuthContext';
import { DefisProvider } from '../components/DefisContext';
import BandeauCompletionProfil from '../components/BandeauCompletionProfil';
import '../styles/print.css'; // Styles impression PDF

function MyApp({ Component, pageProps }) {
  const [afficherBandeau, setAfficherBandeau] = useState(false);
  const [profilVerifie, setProfilVerifie] = useState(false);

  useEffect(() => {
    const verifierProfilComplet = async () => {
      try {
        const { data: profil, error } = await supabase
          .from('profil')
          .select('sexe, niveau_activite')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!error && profil) {
          // Si sexe ou niveau_activite manquants → afficher bandeau
          if (!profil.sexe || !profil.niveau_activite) {
            setAfficherBandeau(true);
          }
        }
        setProfilVerifie(true);
      } catch (err) {
        console.error('Erreur vérification profil:', err);
        setProfilVerifie(true);
      }
    };

    verifierProfilComplet();
  }, []);

  const masquerBandeau = () => {
    setAfficherBandeau(false);
  };

  return (
    <SupabaseProvider>
      <AuthProvider>
        <DefisProvider>
          {profilVerifie && afficherBandeau && <BandeauCompletionProfil onClose={masquerBandeau} />}
          <Component {...pageProps} />
        </DefisProvider>
      </AuthProvider>
    </SupabaseProvider>
  );
}

export default MyApp;
