/**
 * Tickerline — Contact & Support Center
 * Working interactive ticket submission directly connected to platform store.
 */

import React, { useState } from 'react';
import { platformStore } from '../../services/store';
import { Mail, MessageSquare, CheckCircle, Clock } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const currentUser = platformStore.getState().currentUser;
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'loan_status' | 'disbursement' | 'repayments' | 'identity_verification' | 'other'>('loan_status');
  const [message, setMessage] = useState('');
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    const newTicket = platformStore.createSupportTicket({
      userId: currentUser.id,
      subject,
      category,
      message,
    });

    setSubmittedTicketId(newTicket.id);
    setSubject('');
    setMessage('');
  };

  return (
    <section id="contact" className="py-20 bg-slate-950 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Direct Inquiries */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
              Customer Support & Compliance Inquiries
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">
              We’re here to assist your borrowing journey.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Have questions regarding our algorithmic underwriting, state licensing, or blockchain disbursement confirmation times? Reach our US-based support desk.
            </p>

            <div className="pt-6 space-y-4 text-xs text-slate-300">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
                <Mail className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-slate-400 text-[11px]">Direct Support Desk</div>
                  <div className="font-mono font-medium text-white">support@tickerline.com</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
                <Clock className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="text-slate-400 text-[11px]">Operating Hours</div>
                  <div className="text-white">Monday – Friday: 8:00 AM – 8:00 PM EST</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Working Ticket Submission Form */}
          <div className="lg:col-span-7 bg-slate-900 p-8 rounded-2xl border border-slate-800">
            {submittedTicketId ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Support Ticket Logged</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Your ticket <span className="font-mono text-emerald-400 font-semibold">#{submittedTicketId}</span> has been indexed in our customer support queue. Our compliance and loan operations team will review and reply promptly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedTicketId(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg transition-colors border border-slate-700"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-sm font-semibold text-white">Open a Support Ticket</span>
                  <span className="text-xs text-slate-400">Response within 24 hours</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Your Name</label>
                    <input
                      type="text"
                      disabled
                      value={`${currentUser.firstName} ${currentUser.lastName}`}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={currentUser.email}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as typeof category)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="loan_status">Loan Application Status</option>
                    <option value="disbursement">USDT Wallet & Disbursement</option>
                    <option value="repayments">Monthly Repayments & ACH</option>
                    <option value="identity_verification">KYC / Identity Verification</option>
                    <option value="other">General Inquiries / Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Brief summary of your inquiry"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details regarding your question or application..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-sm"
                >
                  Submit Support Ticket
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
