import React, { useState } from 'react';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    updateProfile,
    AuthError
} from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { app } from '../firebaseConfig';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { toast } from 'react-hot-toast';

const auth = getAuth(app);

const Login: React.FC = () => {
    const { t } = useTranslation();
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAuthError = (err: AuthError) => {
        let message;
        switch (err.code) {
            case 'auth/invalid-email':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
            case 'auth/email-already-in-use':
            case 'auth/weak-password':
                 message = t(`firebaseAuthErrors.${err.code.replace('auth/', '')}`, {
                    defaultValue: t('firebaseAuthErrors.default') 
                 });
                 break;
            default:
                message = t('firebaseAuthErrors.default');
                break;
        }
        toast.error(message);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!isLoginView && !displayName.trim()) {
            toast.error(t('notifications.fillDisplayName'));
            setIsLoading(false);
            return;
        }

        try {
            if (isLoginView) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName });
            }
        } catch (err) {
            handleAuthError(err as AuthError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-brand-primary p-4 transition-all duration-500">
            <div className="text-center mb-8">
                 <h1 className="text-5xl font-black tracking-tighter text-white">
                    Cash<span className="text-brand-accent">Home</span>
                </h1>
                <p className="text-brand-text-secondary mt-2">{t('login.subtitle')}</p>
            </div>
            <div className="bg-brand-secondary p-8 rounded-2xl border border-brand-accent/20 shadow-2xl max-w-sm w-full">
                <h2 className="text-2xl font-bold text-center text-white mb-6">{isLoginView ? t('login.welcome') : t('login.createAccount')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLoginView && (
                        <div>
                            <label htmlFor="displayName" className="block text-sm font-medium text-brand-text-secondary mb-2">{t('login.displayName')}</label>
                            <input
                                id="displayName"
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                required
                                className="w-full bg-brand-primary border border-brand-text-secondary/50 rounded-lg px-4 py-2 text-white placeholder-brand-text-secondary focus:ring-brand-accent focus:border-brand-accent transition"
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-brand-text-secondary mb-2">{t('login.email')}</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-brand-primary border border-brand-text-secondary/50 rounded-lg px-4 py-2 text-white placeholder-brand-text-secondary focus:ring-brand-accent focus:border-brand-accent transition"
                        />
                    </div>
                    <div>
                         <label htmlFor="password"className="block text-sm font-medium text-brand-text-secondary mb-2">{t('login.password')}</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-brand-primary border border-brand-text-secondary/50 rounded-lg px-4 py-2 text-white placeholder-brand-text-secondary focus:ring-brand-accent focus:border-brand-accent transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center bg-brand-accent text-white font-semibold py-3 px-4 rounded-lg hover:bg-opacity-80 transition duration-300 disabled:opacity-50 disabled:cursor-wait"
                    >
                        {isLoading ? <SpinnerIcon /> : (isLoginView ? t('login.login') : t('login.signUp'))}
                    </button>
                </form>

                <p className="text-center text-sm text-brand-text-secondary mt-6">
                    {isLoginView ? t('login.noAccount') : t('login.haveAccount')}
                    <button onClick={() => { setIsLoginView(!isLoginView); }} className="font-semibold text-brand-accent hover:underline ml-2">
                        {isLoginView ? t('login.signUp') : t('login.login')}
                    </button>
                </p>
            </div>
            <p className="text-xs text-brand-text-secondary mt-8 text-center max-w-sm">
                {t('login.terms')}
            </p>
        </div>
    );
};

export default Login;