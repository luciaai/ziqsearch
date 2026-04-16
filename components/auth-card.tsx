'use client';

import { useState } from 'react';
import { authClient, signIn } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

type AuthProvider = 'google';

interface AuthIconProps extends React.ComponentProps<'svg'> {}

const AuthIcons = {
  Google: (props: AuthIconProps) => (
    <svg viewBox="0 0 256 262" preserveAspectRatio="xMidYMid" {...props}>
      <path
        d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
        fill="#4285F4"
      />
      <path
        d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
        fill="#34A853"
      />
      <path
        d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
        fill="#FBBC05"
      />
      <path
        d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
        fill="#EB4335"
      />
    </svg>
  ),
};

interface SignInButtonProps {
  title: string;
  provider: AuthProvider;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  callbackURL: string;
  icon: React.ReactNode;
  isLastUsed?: boolean;
}

interface AuthCardProps {
  title: string;
  description: string;
  mode?: 'sign-in' | 'sign-up';
}

const SignInButton = ({ title, provider, loading, setLoading, callbackURL, icon, isLastUsed }: SignInButtonProps) => {
  // Detect if user is on mobile device
  const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  return (
    <button
      className={`
        relative w-full h-12 text-sm
        bg-background
        border border-border
        hover:bg-muted/50 hover:border-foreground/20
        active:scale-[0.99]
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-3
        group
        ${isLastUsed ? 'ring-1 ring-foreground/10' : ''}
      `}
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await signIn.social(
          {
            provider,
            callbackURL,
          },
          {
            onRequest: () => {
              setLoading(true);
            },
            // Use redirect mode on mobile, popup on desktop
            newTab: !isMobile(),
          },
        );
      }}
    >
      <div className="w-5 h-5 flex items-center justify-center">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      </div>
      <span className="font-medium text-foreground/80 group-hover:text-foreground transition-colors">
        {title}
      </span>
      {isLastUsed && (
        <span className="absolute right-3 text-[10px] uppercase tracking-wider text-muted-foreground">
          Last used
        </span>
      )}
    </button>
  );
};

export default function AuthCard({ title, description, mode = 'sign-in' }: AuthCardProps) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const lastMethod = authClient.getLastUsedLoginMethod();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);

    try {
      if (mode === 'sign-up') {
        await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: '/',
        });
      } else {
        await authClient.signIn.email({
          email,
          password,
          callbackURL: '/',
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-light tracking-tight text-foreground font-be-vietnam-pro mb-3">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleEmailAuth} className="space-y-3 mb-4">
        {mode === 'sign-up' && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full h-12 px-4 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-foreground/20"
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full h-12 px-4 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-foreground/20"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full h-12 px-4 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-foreground/20"
        />
        <button
          type="submit"
          disabled={emailLoading}
          className="w-full h-12 text-sm bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {emailLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{mode === 'sign-in' ? 'Signing in...' : 'Creating account...'}</span>
            </>
          ) : (
            <span>{mode === 'sign-in' ? 'Sign in' : 'Create account'}</span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      {/* OAuth Buttons */}
      <div className="space-y-3">
        <SignInButton
          title="Google"
          provider="google"
          loading={googleLoading}
          setLoading={setGoogleLoading}
          callbackURL="/"
          icon={<AuthIcons.Google className="w-4 h-4" />}
          isLastUsed={lastMethod === 'google'}
        />
      </div>

      {/* Switch Auth Mode */}
      <div className="mt-10 text-center">
        <span className="text-sm text-muted-foreground">
          {mode === 'sign-in' ? "Don't have an account? " : 'Already have an account? '}
        </span>
        <Link
          href={mode === 'sign-in' ? '/sign-up' : '/sign-in'}
          className="text-sm font-medium text-foreground hover:underline underline-offset-4 transition-colors"
        >
          {mode === 'sign-in' ? 'Sign up' : 'Sign in'}
        </Link>
      </div>

      {/* Legal */}
      <p className="mt-8 text-[11px] text-center text-muted-foreground leading-relaxed">
        By continuing, you agree to our{' '}
        <Link
          href="/terms"
          className="text-foreground/70 hover:text-foreground underline-offset-2 hover:underline transition-colors"
        >
          Terms
        </Link>{' '}
        and{' '}
        <Link
          href="/privacy-policy"
          className="text-foreground/70 hover:text-foreground underline-offset-2 hover:underline transition-colors"
        >
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
