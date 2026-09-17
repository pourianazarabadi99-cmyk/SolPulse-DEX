import { Provider, useAtom } from 'jotai';
import JupiterApp from './components/Jupiter';
import { ContextProvider } from './contexts/ContextProvider';
import { ScreenProvider } from './contexts/ScreenProvider';
import WalletPassthroughProvider from './contexts/WalletPassthroughProvider';
import { appProps } from './library';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';

const App = () => {
  const queryClient = useMemo(() => new QueryClient(), []);
  const [props] = useAtom(appProps);
  if (!props) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ContextProvider {...props}>
        <WalletPassthroughProvider>
          <ScreenProvider>
            <JupiterApp {...props} />
          </ScreenProvider>
        </WalletPassthroughProvider>
      </ContextProvider>
    </QueryClientProvider>
  );
};

const RenderJupiter = () => {
  return (
    <Provider store={typeof window !== 'undefined' ? window.Jupiter.store : undefined}>
      <App />
    </Provider>
  );
};

export { RenderJupiter };
// ۱. نام برند
const BRAND_NAME = "SolPulse";

// ۲. آدرس ولت شما برای دریافت کارمزد ۰.۱ درصد
const DEV_FEE_ACCOUNT = "BA41shbM2qjy5G9LZQhHkhfu4GDfipMWGzgYz2cb3v3f";
const FEE_BPS = 10; // ۱۰ یعنی ۰.۱ درصد
