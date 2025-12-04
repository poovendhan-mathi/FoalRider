"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        toast({ title: "Message Sent!", description: data.message });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error(data.error || "Failed to send message");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <Badge variant="outline-gold" className="tracking-[0.2em] mb-4">GET IN TOUCH</Badge>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-black mb-4">Contact Us</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            We would love to hear from you. Send us a message and we will respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <Card variant="elevated" className="p-10 rounded-2xl">
            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="font-serif text-2xl font-bold text-black mb-4">Message Sent!</h2>
                <p className="text-gray-500 mb-6">Thank you for reaching out. We will get back to you within 24-48 hours.</p>
                <Button onClick={() => setSubmitted(false)} variant="outline" className="border-[#C5A572] text-[#C5A572] hover:bg-[#C5A572] hover:text-white">
                  Send Another Message
                </Button>
              </div>
            ) : (
              <>
                <h2 className="font-serif text-2xl font-bold text-black mb-8">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-sm font-semibold text-black mb-2 block">Name</Label>
                    <Input id="name" value={formData.name} onChange={handleChange} placeholder="Your name" className="h-12" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-semibold text-black mb-2 block">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" className="h-12" />
                  </div>
                  <div>
                    <Label htmlFor="subject" className="text-sm font-semibold text-black mb-2 block">Subject</Label>
                    <Input id="subject" value={formData.subject} onChange={handleChange} placeholder="How can we help?" className="h-12" />
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-sm font-semibold text-black mb-2 block">Message</Label>
                    <textarea id="message" value={formData.message} onChange={handleChange} placeholder="Your message..." rows={5} className="w-full px-4 py-3 border rounded-md focus:outline-none resize-none" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-14 bg-[#C5A572] hover:bg-[#B89968] text-white font-semibold">
                    {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Sending...</> : <><Send className="mr-2 h-5 w-5" />Send Message</>}
                  </Button>
                </form>
              </>
            )}
          </Card>

          <div className="space-y-6">
            <Card variant="warm" className="p-8 rounded-2xl border border-gray-200">
              <h3 className="font-serif text-xl font-bold text-black mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-[#C5A572]/10 rounded-lg"><Mail className="h-5 w-5 text-[#C5A572]" /></div>
                  <div>
                    <p className="font-semibold text-black">Email</p>
                    <a href="mailto:support@foalrider.com" className="text-gray-600 hover:text-[#C5A572]">support@foalrider.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-[#C5A572]/10 rounded-lg"><Phone className="h-5 w-5 text-[#C5A572]" /></div>
                  <div>
                    <p className="font-semibold text-black">Phone</p>
                    <a href="tel:+911234567890" className="text-gray-600 hover:text-[#C5A572]">+91 123 456 7890</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-[#C5A572]/10 rounded-lg"><MapPin className="h-5 w-5 text-[#C5A572]" /></div>
                  <div>
                    <p className="font-semibold text-black">Address</p>
                    <p className="text-gray-600">123 Denim Street<br/>Fashion District<br/>Mumbai, Maharashtra 400001</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card variant="warm" className="p-8 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#C5A572]/10 rounded-lg"><Clock className="h-5 w-5 text-[#C5A572]" /></div>
                <h3 className="font-serif text-xl font-bold text-black">Business Hours</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-gray-600">Monday - Friday</span><span className="font-semibold text-black">9:00 AM - 6:00 PM</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Saturday</span><span className="font-semibold text-black">10:00 AM - 4:00 PM</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Sunday</span><span className="font-semibold text-red-500">Closed</span></div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
