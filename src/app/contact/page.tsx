import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Send, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24">
      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-16">
          <Badge variant="outline-gold" className="tracking-[0.2em] mb-4">
            GET IN TOUCH
          </Badge>
          <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold text-black mb-4">
            Contact Us
          </h1>
          <p className="font-['Montserrat'] text-lg text-[#9CA3AF] max-w-2xl mx-auto">
            We&apos;d love to hear from you. Send us a message and we&apos;ll
            respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card variant="elevated" className="p-10 rounded-2xl">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-black mb-8">
              Send us a Message
            </h2>

            <form className="space-y-6">
              <div>
                <Label
                  htmlFor="name"
                  className="font-['Montserrat'] text-sm font-semibold text-black mb-2 block"
                >
                  Name
                </Label>
                <Input id="name" placeholder="Your name" />
              </div>

              <div>
                <Label
                  htmlFor="email"
                  className="font-['Montserrat'] text-sm font-semibold text-black mb-2 block"
                >
                  Email
                </Label>
                <Input id="email" type="email" placeholder="your@email.com" />
              </div>

              <div>
                <Label
                  htmlFor="subject"
                  className="font-['Montserrat'] text-sm font-semibold text-black mb-2 block"
                >
                  Subject
                </Label>
                <Input id="subject" placeholder="What can we help you with?" />
              </div>

              <div>
                <Label
                  htmlFor="message"
                  className="font-['Montserrat'] text-sm font-semibold text-black mb-2 block"
                >
                  Message
                </Label>
                <textarea
                  id="message"
                  rows={6}
                  placeholder="Tell us more about your inquiry..."
                  className="w-full px-4 py-3 font-['Montserrat'] text-black placeholder:text-[#9CA3AF] bg-white border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#C5A572] focus:ring-2 focus:ring-[#C5A572]/20 transition-all duration-200 resize-none"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                variant="gold"
                className="w-full h-14 text-base"
              >
                <Send className="mr-2 h-5 w-5" />
                Send Message
              </Button>
            </form>

            <p className="font-['Montserrat'] text-sm text-[#9CA3AF] text-center mt-8">
              We&apos;ll get back to you within 24-48 hours
            </p>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card variant="elevated" className="p-10 rounded-2xl">
              <h2 className="font-['Playfair_Display'] text-2xl font-bold text-black mb-8">
                Get in Touch
              </h2>

              <div className="space-y-8">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#C5A572]/10 rounded-xl shrink-0">
                    <Mail className="h-6 w-6 text-[#C5A572]" />
                  </div>
                  <div>
                    <h3 className="font-['Montserrat'] font-semibold text-black mb-1">
                      Email
                    </h3>
                    <p className="font-['Montserrat'] text-[#4B5563]">
                      support@foalrider.com
                    </p>
                    <p className="font-['Montserrat'] text-[#4B5563]">
                      sales@foalrider.com
                    </p>
                  </div>
                </div>

                <div className="h-px bg-[#E5E5E5]" />

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#C5A572]/10 rounded-xl shrink-0">
                    <Phone className="h-6 w-6 text-[#C5A572]" />
                  </div>
                  <div>
                    <h3 className="font-['Montserrat'] font-semibold text-black mb-1">
                      Phone
                    </h3>
                    <p className="font-['Montserrat'] text-[#4B5563]">
                      +91 98765 43210
                    </p>
                    <p className="font-['Montserrat'] text-sm text-[#9CA3AF]">
                      Mon-Sat, 9AM-6PM IST
                    </p>
                  </div>
                </div>

                <div className="h-px bg-[#E5E5E5]" />

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#C5A572]/10 rounded-xl shrink-0">
                    <MapPin className="h-6 w-6 text-[#C5A572]" />
                  </div>
                  <div>
                    <h3 className="font-['Montserrat'] font-semibold text-black mb-1">
                      Office
                    </h3>
                    <p className="font-['Montserrat'] text-[#4B5563]">
                      123 Fashion Street
                      <br />
                      Mumbai, Maharashtra 400001
                      <br />
                      India
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Business Hours */}
            <Card
              variant="warm"
              className="p-8 rounded-2xl border border-[#E5E5E5]"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#C5A572]/10 rounded-lg">
                  <Clock className="h-5 w-5 text-[#C5A572]" />
                </div>
                <h3 className="font-['Playfair_Display'] text-xl font-bold text-black">
                  Business Hours
                </h3>
              </div>
              <div className="space-y-3 font-['Montserrat']">
                <div className="flex justify-between">
                  <span className="text-[#4B5563]">Monday - Friday</span>
                  <span className="font-semibold text-black">
                    9:00 AM - 6:00 PM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4B5563]">Saturday</span>
                  <span className="font-semibold text-black">
                    10:00 AM - 4:00 PM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4B5563]">Sunday</span>
                  <span className="font-semibold text-red-500">Closed</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
