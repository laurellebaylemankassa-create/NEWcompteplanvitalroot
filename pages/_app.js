import { SupabaseProvider } from '../lib/supabaseClient';
import { DefisProvider } from '../components/DefisContext';

function MyApp({ Component, pageProps }) {
  return (
    <SupabaseProvider>
      <DefisProvider>
        <Component {...pageProps} />
      </DefisProvider>
    </SupabaseProvider>
  );
}

export default MyApp;
