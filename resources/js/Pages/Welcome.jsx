import { Link, Head } from '@inertiajs/react';
import demonIcon from '@/Assets/icons8-demon-100.png';
import movingBg from '@/Assets/172001.gif';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="flex min-h-screen bg-gray-50 font-sans antialiased">
                
                {/* LEFT SIDE: Login Form / Action Panel */}
                <div className="flex flex-col justify-between w-full p-8 md:w-1/2 sm:p-16 lg:p-24 bg-white">
                    {/* Logo/Brand */}
                    <div className="flex items-center gap-2 text-black-600 font-bold text-lg">
                        <span className="h-4 w-2 bg-stone-600 rounded-sm"></span>
                        Prototype
                    </div>

                    {/* Main Content Area */}
                    <div className="w-full max-w-md mx-auto my-auto space-y-8">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                                Hello,<br />Welcome Back
                            </h1>
                            <p className="text-sm text-gray-500">
                                Hey, welcome back to your special place
                            </p>
                        </div>

                        {/* Navigation Actions */}
                        <div className="space-y-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="flex w-full justify-center items-center rounded-xl bg-stone-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-stone-500 transition"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <Link
                                        href={route('login')}
                                        className="flex w-full justify-center items-center rounded-xl bg-stone-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-stone-500 transition"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="flex w-full justify-center items-center rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-stone-50 transition"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer / Registration Link */}
                    <div className="text-xs text-gray-400 text-center md:text-left">
                        Don't have an account?{' '}
                        <Link href={route('register')} className="text-sky-600 font-semibold hover:underline">
                            Sign Up
                        </Link>
                    </div>
                </div>

                {/* RIGHT SIDE: Art/Illustration Banner (Hidden on Mobile Views) */}
                <div className="hidden md:flex w-1/2 items-center justify-center p-12 relative overflow-hidden m-4 rounded-3xl bg-black">
    {/* Moving Background Layer */}
    <img 
        src={movingBg} 
        alt="Background Animation" 
        className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen" 
    />

    {/* Decorative Background Glows */}
    <div className="absolute top-12 left-12 w-24 h-12 bg-white/20 rounded-full blur-sm"></div>
    <div className="absolute bottom-16 right-16 w-36 h-16 bg-white/10 rounded-full blur-md"></div>
    
    {/* Graphic Container (Make sure 'relative' is kept to stay above the background image) */}
    <div className="relative text-center text-white space-y-4 max-w-sm">
        <div className="inline-flex p-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20">
            <img 
                src={demonIcon} 
                alt="Demon Icon" 
                className="w-24 h-24 object-contain drop-shadow-lg  invert brightness-0" 
            />
        </div>

        <h3 className="text-xl font-bold tracking-wide mt-4">Laravel Prototyping</h3>
        <p className="text-sm text-purple-100 leading-relaxed">
            Laravel Prototype Testing
        </p>
    </div>
</div>

            </div>
        </>
    );
}