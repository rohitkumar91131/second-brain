import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-[#fafafa] text-notion-text selection:bg-blue-100 font-sans">
            <nav className="fixed top-0 w-full z-50 bg-notion-bg/80 backdrop-blur-md border-b border-notion-border">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="inline-flex items-center gap-2 text-notion-muted hover:text-notion-text transition-colors font-medium text-sm">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                    <div className="font-semibold text-sm">Terms of Service</div>
                </div>
            </nav>

            <main className="pt-32 pb-24 px-6 max-w-3xl mx-auto space-y-16">
                <header className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-notion-bg shadow-xl shadow-black/5 border border-notion-border mb-8">
                        <BookOpen size={32} className="text-notion-text" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-gray-900">Terms of Service</h1>
                    <p className="text-xl text-notion-muted max-w-xl mx-auto leading-relaxed">
                        Please read these terms carefully before engaging with our platform. They outline your rights and our shared responsibilities.
                    </p>
                </header>

                <section className="bg-notion-bg p-8 md:p-12 rounded-[2rem] shadow-sm border border-notion-border">
                    <div className="space-y-12">

                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <CheckCircle2 className="text-blue-500" />
                                <h2 className="text-xl font-bold m-0 text-gray-900">Acceptance of Terms</h2>
                            </div>
                            <p className="text-notion-muted leading-relaxed">
                                By accessing or using our services, you confirm your agreement to be bound by these terms. If you disagree with any part of these terms, please discontinue your use of the service.
                            </p>
                        </div>

                        <div className="h-px w-full bg-[#f0f0f0]" />

                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <FileText className="text-indigo-500" />
                                <h2 className="text-xl font-bold m-0 text-gray-900">User Obligations</h2>
                            </div>
                            <p className="text-notion-muted leading-relaxed mb-4">
                                You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.
                            </p>
                            <ul className="list-disc pl-5 space-y-2 text-notion-muted">
                                <li>You must be at least 13 years of age.</li>
                                <li>You will not upload malicious code or illegal content.</li>
                                <li>You maintain ownership of all intellectual property you upload.</li>
                            </ul>
                        </div>

                        <div className="h-px w-full bg-[#f0f0f0]" />

                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle className="text-orange-500" />
                                <h2 className="text-xl font-bold m-0 text-gray-900">Limitation of Liability</h2>
                            </div>
                            <p className="text-notion-muted leading-relaxed">
                                We continuously strive to maintain high availability and data integrity. However, we cannot guarantee that the service will be entirely free from errors, interruptions, or data loss. We provide the service &apos;as is&apos; without explicit warranties.
                            </p>
                        </div>
                    </div>
                </section>

                <footer className="text-center text-sm text-notion-muted">
                    <p>By using this website, you agree to these Terms of Service.</p>
                    <p className="mt-2">Last updated: {new Date().toLocaleDateString()}</p>
                </footer>
            </main>
        </div>
    );
}
