'use client'

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Eye, FileText, ArrowLeft, Database, UserCheck } from 'lucide-react';

export default function PrivacyPolicy() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-white text-[#37352f] selection:bg-blue-100">
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#e9e9e7]">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-[#787774] hover:text-[#37352f] transition-colors font-medium text-sm outline-none"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div className="font-semibold text-sm">Privacy Policy</div>
                </div>
            </nav>

            <main className="pt-32 pb-24 px-6 max-w-3xl mx-auto">
                <header className="mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mb-8">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Your Privacy is our Priority</h1>
                    <p className="text-xl text-[#787774] leading-relaxed">
                        We believe that your data is exactly that—yours. We design our systems to keep it safe, private, and secure at all times.
                    </p>
                </header>

                <article className="prose prose-lg prose-headings:font-bold prose-headings:tracking-tight prose-p:text-[#37352f]/80 max-w-none">
                    <div className="space-y-12">

                        {/* Realistic Security Section */}
                        <section className="bg-[#fcfcfc] border border-[#e9e9e7] rounded-3xl p-8 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-[#e9e9e7]">
                                    <Database className="text-purple-500" size={24} />
                                </div>
                                <h2 className="text-2xl font-bold m-0">Secure Infrastructure</h2>
                            </div>
                            <p className="text-[#787774] leading-relaxed">
                                Your data is protected using industry-standard encryption protocols. We use Secure Socket Layer (SSL/TLS) technology to encrypt data in transit and employ encryption at rest to safeguard your notes on our servers.
                            </p>
                        </section>

                        {/* User Control Section */}
                        <section className="bg-[#fcfcfc] border border-[#e9e9e7] rounded-3xl p-8 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-[#e9e9e7]">
                                    <UserCheck className="text-blue-500" size={24} />
                                </div>
                                <h2 className="text-2xl font-bold m-0">Data Ownership</h2>
                            </div>
                            <p className="text-[#787774] leading-relaxed">
                                You have full control over your content. You can modify, export, or permanently delete your data at any time. When you choose to delete your account, we ensure that all associated data is wiped from our active databases.
                            </p>
                        </section>

                        <section className="bg-[#fcfcfc] border border-[#e9e9e7] rounded-3xl p-8 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-[#e9e9e7]">
                                    <Eye className="text-green-500" size={24} />
                                </div>
                                <h2 className="text-2xl font-bold m-0">Zero Tracking</h2>
                            </div>
                            {/* FIXED LINE BELOW: Using &apos; instead of ' */}
                            <p className="text-[#787774] leading-relaxed">
                                We do not sell, rent, or monetize your personal data. We don&apos;t use tracking cookies for advertising purposes. Our focus is solely on building a powerful tool for your productivity.
                            </p>
                        </section>

                        <section className="bg-[#fcfcfc] border border-[#e9e9e7] rounded-3xl p-8 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-[#e9e9e7]">
                                    <FileText className="text-orange-500" size={24} />
                                </div>
                                <h2 className="text-2xl font-bold m-0">Minimal Collection</h2>
                            </div>
                            <p className="text-[#787774] leading-relaxed">
                                We only collect essential information like your email address and basic profile details required for account management and synchronization across your devices.
                            </p>
                        </section>
                    </div>

                    <div className="mt-16 pt-8 border-t border-[#e9e9e7]">
                        <h3 className="text-xl font-bold mb-4">Contacting Us</h3>
                        <p className="text-[#787774]">
                            If you have any questions about our privacy practices or wish to submit a data deletion request, please reach out to us at <a href="mailto:privacy@secondbrain.demo" className="text-blue-600 hover:underline">support@secondbrain.demo</a>.
                        </p>
                        <p className="text-sm text-[#9b9a97] mt-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                </article>
            </main>
        </div>
    );
}