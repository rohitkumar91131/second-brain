import React from 'react';
import Link from 'next/link';
import { Shield, Lock, Eye, FileText, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-white text-[#37352f] selection:bg-blue-100">
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#e9e9e7]">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="inline-flex items-center gap-2 text-[#787774] hover:text-[#37352f] transition-colors font-medium text-sm">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
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

                        <section className="bg-[#fcfcfc] border border-[#e9e9e7] rounded-3xl p-8 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-[#e9e9e7]">
                                    <Lock className="text-purple-500" size={24} />
                                </div>
                                <h2 className="text-2xl font-bold m-0">End-to-End Security</h2>
                            </div>
                            <p className="text-[#787774] leading-relaxed">
                                All of your habit data, notes, and personal information are encrypted in transit and at rest. We employ industry-leading standards to ensure your second brain remains impregnable.
                            </p>
                        </section>

                        <section className="bg-[#fcfcfc] border border-[#e9e9e7] rounded-3xl p-8 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-[#e9e9e7]">
                                    <Eye className="text-green-500" size={24} />
                                </div>
                                <h2 className="text-2xl font-bold m-0">Zero Tracking</h2>
                            </div>
                            <p className="text-[#787774] leading-relaxed">
                                We do not sell, rent, or monetize your data. Our business model is based entirely on providing you with the best productivity tool, not turning you into a product.
                            </p>
                        </section>

                        <section className="bg-[#fcfcfc] border border-[#e9e9e7] rounded-3xl p-8 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-[#e9e9e7]">
                                    <FileText className="text-blue-500" size={24} />
                                </div>
                                <h2 className="text-2xl font-bold m-0">Transparent Practices</h2>
                            </div>
                            <p className="text-[#787774] leading-relaxed">
                                We collect only the bare minimum information needed to operate the service—an email address to identify your account and your encrypted notes. You can export or delete your data permanently at any given moment.
                            </p>
                        </section>
                    </div>

                    <div className="mt-16 pt-8 border-t border-[#e9e9e7]">
                        <h3 className="text-xl font-bold mb-4">Contacting Us</h3>
                        <p className="text-[#787774]">
                            If you have any questions about our privacy practices or wish to submit a data deletion request, please reach out to our dedicated privacy team at <a href="mailto:privacy@secondbrain.demo" className="text-blue-600 hover:underline">privacy@secondbrain.demo</a>.
                        </p>
                        <p className="text-sm text-[#9b9a97] mt-8">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>
                </article>
            </main>
        </div>
    );
}
