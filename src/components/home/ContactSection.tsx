import { type ChangeEvent, type FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Linkedin, Github, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { contact } from "@/data/contact";

const contactMethods = [
  {
    icon: Mail,
    label: "Email",
    value: contact.email,
    href: `mailto:${contact.email}`,
    color: "blue",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    value: "Connect professionally",
    href: contact.linkedin,
    color: "indigo",
  },
  {
    icon: Github,
    label: "GitHub",
    value: "View my projects",
    href: contact.github,
    color: "slate",
  },
];

const colorMap: Record<string, string> = {
  blue: "from-blue-500 to-blue-600",
  indigo: "from-indigo-500 to-indigo-600",
  slate: "from-slate-500 to-slate-600",
};

// Opens the visitor's mail client with the message pre-filled — works with
// zero backend or third-party signup. If a hosted form service (Formspree,
// Web3Forms, etc.) is ever wired up, swap the onSubmit handler for a fetch().
export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Message from ${name || "your site"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;
  };

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-6">
            Let's
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-medium">
              {" "}Connect
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Ready to tackle complex challenges together? Whether it's a consulting opportunity
            or a collaborative project, I'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <motion.a
              key={method.label}
              href={method.href}
              target={method.href.startsWith("http") ? "_blank" : undefined}
              rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="block p-6 bg-white rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorMap[method.color]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <method.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">{method.label}</h3>
                    <p className="text-slate-600 text-sm">{method.value}</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
            </motion.a>
          ))}
        </div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Name</Label>
              <Input id="contact-name" value={name} onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input id="contact-email" type="email" value={email} onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-message">Message</Label>
            <Textarea id="contact-message" rows={5} value={message} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full md:w-auto">Send message</Button>
        </motion.form>
      </div>
    </section>
  );
}
