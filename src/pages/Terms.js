import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";

const sections = [
  { id: "introduction", title: "1. Introduction" },
  { id: "definitions", title: "2. Definitions" },
  { id: "scope", title: "3. Scope of Services" },
  { id: "registration", title: "4. Registration" },
  { id: "property-info", title: "5. Property Information" },
  { id: "builder", title: "6. Builder Responsibilities" },
  { id: "homeowner", title: "7. Homeowner Responsibilities" },
  { id: "vendors", title: "8. Vendors & Contractors" },
  { id: "qr-code", title: "9. QR Code Access" },
  { id: "data-ip", title: "10. Data & IP" },
  { id: "privacy", title: "11. Data Protection" },
  { id: "payments", title: "12. Payments" },
  { id: "acceptable-use", title: "13. Acceptable Use" },
  { id: "third-party", title: "14. Third-Party" },
  { id: "availability", title: "15. Availability" },
  { id: "disclaimers", title: "16. Disclaimers" },
  { id: "liability", title: "17. Limitation of Liability" },
  { id: "indemnification", title: "18. Indemnification" },
  { id: "termination", title: "19. Termination" },
  { id: "grievance", title: "20. Grievance" },
  { id: "changes", title: "21. Changes" },
  { id: "law", title: "22. Governing Law" },
  { id: "force-majeure", title: "23. Force Majeure" },
  { id: "severability", title: "24. Severability" },
  { id: "entire-agreement", title: "25. Entire Agreement" },
  { id: "contact", title: "26. Contact" },
];

export default function Terms() {
  const [activeSection, setActiveSection] = useState("");
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Scrollspy logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -80% 0px" }
    );
    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen bg-paper w-full overflow-x-hidden">
      
      {/* --- BLUEPRINT BACKGROUND --- */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4F7DAD]/10 blur-[120px]" />
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(#4F7DAD 1px, transparent 1px), linear-gradient(90deg, #4F7DAD 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* --- READING PROGRESS BAR --- */}
      <motion.div
        className="fixed left-0 right-0 top-0 z-50 h-1 origin-left bg-[#4F7DAD]"
        style={{ scaleX }}
      />

      {/* --- FULL WIDTH CONTAINER --- */}
      <div className="relative z-10 w-full px-6 py-20 lg:px-12">
        
        <div className="flex flex-col gap-16 lg:flex-row lg:gap-16">
          
          {/* --- STICKY SIDEBAR (Left Side) --- */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 scrollbar-hide">
              <Link 
                to="/" 
                className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-[#4F7DAD]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Home
              </Link>

              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">Table of Contents</h4>
              <ul className="space-y-2 border-l border-line/50 text-sm">
                {sections.map((sec) => (
                  <li key={sec.id}>
                    <a
                      href={`#${sec.id}`}
                      className={`block border-l-2 py-1.5 pl-4 transition-all duration-200 ${
                        activeSection === sec.id
                          ? "border-[#4F7DAD] text-[#4F7DAD] font-medium"
                          : "border-transparent text-muted hover:border-line hover:text-ink"
                      }`}
                    >
                      {sec.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* --- LEGAL CONTENT (Takes up remaining space) --- */}
          <div className="min-w-0 flex-1 lg:max-w-5xl">
            
            {/* Mobile Back Button */}
            <Link 
              to="/" 
              className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-[#4F7DAD] lg:hidden"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>

            {/* Header */}
            <div className="border-b border-line pb-10">
              <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">Terms and Conditions</h1>
              <p className="mt-4 text-lg font-medium text-ink">SpaceScanner</p>
              <p className="mt-1 text-sm text-muted">Operated by Home Scanner Technologies Private Limited</p>
              
              <div className="mt-6 grid gap-x-8 gap-y-2 text-sm text-muted sm:grid-cols-2 lg:grid-cols-3">
                <p><strong>Effective Date:</strong> [Insert date]</p>
                <p><strong>Last Updated:</strong> [Insert date]</p>
                <p><strong>Website:</strong> [Insert official website URL]</p>
                <p><strong>Registered Office:</strong> [Insert address]</p>
                <p><strong>Contact Email:</strong> [Insert email]</p>
                <p><strong>Grievance Officer:</strong> [Insert name]</p>
              </div>
            </div>

            {/* Content Body */}
            <div className="prose prose-lg mt-12 max-w-none text-muted marker:text-[#4F7DAD] prose-headings:font-medium prose-headings:tracking-tight prose-headings:text-ink prose-headings:scroll-mt-28 prose-strong:text-ink prose-ul:text-muted">
              
              <h2 id="introduction">1. Introduction and Acceptance</h2>
              <p>These Terms and Conditions (“Terms”) govern your access to and use of the SpaceScanner website, mobile applications, digital platforms, features and related services (collectively, the “Platform”).</p>
              <p>SpaceScanner is a digital property documentation and management platform operated by <strong>Home Scanner Technologies Private Limited</strong> (“SpaceScanner”, “Company”, “we”, “us” or “our”).</p>
              <p>By accessing, registering for, or using the Platform, you (“User” or “you”) agree to be bound by these Terms and our applicable Privacy Policy.</p>
              <p>If you do not agree with these Terms, you must not access or use the Platform.</p>
              <p>These Terms apply to all categories of Users, including:</p>
              <ul>
                <li>Builders and Developers</li>
                <li>Homeowners and property owners</li>
                <li>Vendors and Service Providers</li>
                <li>Architects and Contractors</li>
              </ul>
              <p>Additional agreements may apply to particular services or commercial relationships, including builder onboarding, subscriptions, vendor partnerships or enterprise services.</p>

              <h2 id="definitions">2. Definitions</h2>
              <p>For the purposes of these Terms:</p>
              <p><strong>“Platform”</strong> means the SpaceScanner website, mobile applications, software, tools and associated services.</p>
              <p><strong>“User Account”</strong> means an account created by a User to access the Platform.</p>
              <p><strong>“Property”</strong> means a residential, commercial or other real estate unit or premises documented through SpaceScanner.</p>
              <p><strong>“Property Record”</strong> means the digital information associated with a Property, including materials, products, specifications, photographs, documents, warranties, installation details and maintenance records.</p>
              <p><strong>“Digital Property Record” or “Digital Passport”</strong> means the digital record created and maintained on the Platform for a Property.</p>
              <p><strong>“QR Code”</strong> means a unique scannable code associated with a Property Record that enables access to selected property information in accordance with the access settings and permissions configured for that record.</p>
              <p><strong>“User Content”</strong> means information, photographs, drawings, documents, videos, specifications, records and other material uploaded, submitted or shared by a User.</p>
              <p><strong>“Paid Services”</strong> means subscriptions, premium features, onboarding services, storage or other chargeable services offered by SpaceScanner.</p>
              <p><strong>“Third-Party Services”</strong> means services, products, platforms or applications provided by parties other than SpaceScanner.</p>

              <h2 id="scope">3. Scope of Services</h2>
              <p>SpaceScanner provides digital tools to create, store, organize, access and manage information relating to properties.</p>
              <p>Depending on the features made available, the Platform may include:</p>
              <ol>
                <li>Digital property documentation and records.</li>
                <li>Material and product details, including brands, specifications and sources.</li>
                <li>Warranty information, invoices, manuals and supporting documents.</li>
                <li>Photographs and records relating to electrical, plumbing and other installations.</li>
                <li>Property-related drawings, plans and technical documents.</li>
                <li>QR-based access to selected property information.</li>
                <li>Maintenance, repair and service records.</li>
                <li>Builder-to-homeowner digital handover documentation.</li>
                <li>Vendor, architect and contractor-related documentation.</li>
                <li>Other property-related digital services introduced by SpaceScanner.</li>
              </ol>
              <p>The availability of a feature may depend on the User's account type, subscription, permissions, technical compatibility and the applicable commercial agreement.</p>
              <p>SpaceScanner may introduce, modify, suspend or discontinue features in accordance with these Terms and applicable law.</p>

              <h2 id="registration">4. User Registration and Account Responsibilities</h2>
              <p>4.1. Certain Platform features may require registration and creation of a User Account.</p>
              <p>4.2. You agree to provide accurate, complete and current information during registration and while using the Platform.</p>
              <p>4.3. You are responsible for maintaining the confidentiality of your login credentials and for activities conducted through your account.</p>
              <p>4.4. You must promptly notify SpaceScanner if you suspect unauthorized access to your account.</p>
              <p>4.5. You must not create an account using another person's identity or provide misleading information about your role, property ownership or authority.</p>
              <p>4.6. SpaceScanner reserves the right to restrict, suspend or refuse accounts that violate these Terms or applicable law.</p>
              <p>4.7. Users must be legally competent to enter into a binding agreement under applicable Indian law. Where an organization or business creates an account, the individual registering represents that they are authorized to act on its behalf.</p>

              <h2 id="property-info">5. Property Information and User Responsibilities</h2>
              <p>5.1. Users may upload or submit property-related information, including photographs, plans, drawings, material specifications, invoices, warranty documents and installation records.</p>
              <p>5.2. The User submitting information is responsible for ensuring that it is accurate, complete, lawful and appropriately updated.</p>
              <p>5.3. SpaceScanner generally relies on information provided by Users, builders, vendors, contractors and other authorized contributors. Unless expressly agreed in writing, SpaceScanner does not independently inspect, certify, test or verify every property record or document.</p>
              <p>5.4. A digital record on SpaceScanner should not automatically be treated as proof of:</p>
              <ul>
                <li>Structural safety or stability.</li>
                <li>Quality or compliance of construction.</li>
                <li>Correctness of electrical, plumbing or other installations.</li>
                <li>Ownership or legal title to a property.</li>
                <li>Authenticity of a product, invoice, warranty or certificate.</li>
                <li>Compliance with building regulations or statutory requirements.</li>
              </ul>
              <p>5.5. Users must independently verify critical technical, safety, legal and financial information with appropriately qualified professionals or relevant authorities before relying on it.</p>
              <p>5.6. Users must not upload confidential, personal or third-party information unless they have the necessary rights, authority or lawful basis to do so.</p>

              <h2 id="builder">6. Builder and Developer Responsibilities</h2>
              <p>Builders and Developers using SpaceScanner agree that they will:</p>
              <ol>
                <li>Upload or provide information that is accurate to the best of their knowledge.</li>
                <li>Ensure that they are authorized to share the relevant property information and documents.</li>
                <li>Obtain any permissions, notices or consents required under applicable law before submitting personal or third-party information.</li>
                <li>Take reasonable steps to ensure that records correspond to the relevant property or unit.</li>
                <li>Update or correct information when they become aware of material inaccuracies.</li>
                <li>Use QR codes and sharing permissions responsibly.</li>
                <li>Ensure that their employees, contractors or representatives using the Platform comply with these Terms.</li>
              </ol>
              <p>Builders and Developers remain responsible for their construction, contractual, statutory, warranty and handover obligations.</p>
              <p>Use of SpaceScanner does not replace any statutory handover documents, approvals, certificates or obligations imposed on a Builder or Developer.</p>
              <p>Specific commercial arrangements, pricing, onboarding responsibilities, service levels and project deliverables may be governed by a separate written agreement between SpaceScanner and the relevant Builder or Developer.</p>

              <h2 id="homeowner">7. Homeowner Responsibilities</h2>
              <p>Homeowners using the Platform agree to:</p>
              <ol>
                <li>Provide accurate information about their property and account.</li>
                <li>Upload only documents and content that they are entitled to share.</li>
                <li>Keep their account credentials secure.</li>
                <li>Review property records and report material inaccuracies where possible.</li>
                <li>Manage sharing permissions responsibly.</li>
                <li>Avoid using the Platform to upload unlawful, misleading or infringing content.</li>
              </ol>
              <p>A Homeowner should not assume that every record has been supplied, reviewed or verified by SpaceScanner or the relevant Builder, Developer, Vendor or Contractor.</p>

              <h2 id="vendors">8. Vendors, Service Providers, Architects and Contractors</h2>
              <p>8.1. Vendors, Service Providers, Architects and Contractors may use the Platform to submit or manage property-related information, subject to the permissions granted to them.</p>
              <p>8.2. Such Users are responsible for the accuracy of the information and documents they provide.</p>
              <p>8.3. They must not upload information relating to a property without appropriate authorization.</p>
              <p>8.4. Any professional advice, workmanship, product warranty, installation, repair or service provided by these Users remains their responsibility.</p>
              <p>8.5. SpaceScanner does not automatically become a party to a contract between a Homeowner, Builder, Vendor, Service Provider, Architect or Contractor merely because information about that relationship is stored on the Platform.</p>
              <p>8.6. Any separate commercial or service relationship between these parties must be governed by their own applicable agreements.</p>

              <h2 id="qr-code">9. QR Code and Property Information Access</h2>
              <p>9.1. SpaceScanner may generate a QR Code linked to a Property Record.</p>
              <p>9.2. The QR Code is intended to provide access to <strong>selected property information</strong> made available for sharing by an authorized User, subject to the Platform's access settings and permissions.</p>
              <p>9.3. Not all information stored in a Property Record is necessarily accessible through the QR Code.</p>
              <p>9.4. Users responsible for managing a Property Record must take care when selecting information for sharing. They should not make confidential, sensitive or personal information publicly accessible unless they have the necessary authority and intend to do so.</p>
              <p>9.5. A person who scans a QR Code may be able to view the information made accessible through that code without necessarily having a SpaceScanner account, depending on the applicable access settings.</p>
              <p>9.6. Users must not copy, alter, misuse, duplicate or distribute QR Codes to obtain unauthorized access to property information.</p>
              <p>9.7. SpaceScanner may provide or modify access-control, permission, QR Code replacement, revocation or related features as part of the Platform. The availability and operation of these features depend on the functionality actually provided.</p>
              <p>9.8. A QR Code or Property Record is not a title document, ownership certificate, statutory approval or legal proof of ownership.</p>

              <h2 id="data-ip">10. Data Storage, Ownership and Intellectual Property</h2>
              <p>10.1. <strong>User Content:</strong> Subject to applicable law and the rights of third parties, Users retain their ownership rights in the documents, photographs, drawings and other content they upload.</p>
              <p>10.2. <strong>License to SpaceScanner:</strong> By uploading or submitting User Content, you grant SpaceScanner a non-exclusive, worldwide, royalty-free license to host, store, reproduce, process, organize, display and transmit that content only to the extent reasonably necessary to:</p>
              <ul>
                <li>Provide and operate the Platform.</li>
                <li>Create and maintain Property Records.</li>
                <li>Make selected information available to authorized Users.</li>
                <li>Provide customer support and technical assistance.</li>
                <li>Maintain security, backups and service reliability.</li>
                <li>Comply with legal obligations.</li>
              </ul>
              <p>10.3. This license does not transfer ownership of your User Content to SpaceScanner.</p>
              <p>10.4. <strong>SpaceScanner Intellectual Property:</strong> The Platform, including its software, source code, design, interface, branding, logos, trademarks, technology, databases, features and original content, is owned by or licensed to SpaceScanner and is protected by applicable intellectual property laws.</p>
              <p>10.5. Users must not copy, reproduce, modify, reverse engineer, distribute, sell or commercially exploit SpaceScanner's intellectual property without prior written permission, except where expressly permitted by law.</p>
              <p>10.6. Nothing in these Terms gives a User ownership of the SpaceScanner Platform or its underlying technology.</p>

              <h2 id="privacy">11. Data Protection and Privacy</h2>
              <p>11.1. SpaceScanner hosts and stores property documents and records submitted through the Platform.</p>
              <p>11.2. SpaceScanner may process personal data such as names, contact details, account information and personal information included in property documents, in accordance with its Privacy Policy and applicable law.</p>
              <p>11.3. The Privacy Policy explains the categories of information collected, purposes of processing, sharing arrangements, retention practices, security measures and applicable User rights.</p>
              <p>11.4. Users must not submit another person's personal data unless they have the necessary authority and have complied with applicable legal requirements.</p>
              <p>11.5. Where a Builder, Developer or other organization submits personal data relating to homeowners, occupants, employees or other individuals, that organization is responsible for ensuring that it has the necessary authority and has provided required notices or obtained required permissions.</p>
              <p>11.6. Depending on the nature of the service and the relevant processing activity, SpaceScanner may act as a Data Fiduciary or process personal data on behalf of another organization. The respective responsibilities will be determined by the actual relationship, applicable law and any separate data-processing agreement.</p>
              <p>11.7. SpaceScanner will take reasonable technical and organizational measures designed to protect information stored on the Platform against unauthorized access, disclosure, alteration or destruction.</p>
              <p>11.8. No internet-based platform can guarantee absolute security. Users should retain their own copies of important documents and avoid sharing account credentials.</p>
              <p>11.9. Personal data will be retained for as long as reasonably necessary for the purposes described in the Privacy Policy, subject to applicable legal, contractual and regulatory requirements.</p>
              <p>11.10. Requests relating to personal data, including applicable rights and grievances, may be submitted through the contact details specified in the Privacy Policy.</p>

              <h2 id="payments">12. Free Services, Paid Services and Payments</h2>
              <p>12.1. SpaceScanner may offer a combination of free and paid services.</p>
              <p>12.2. The scope of free services may be limited and may change from time to time, subject to applicable law.</p>
              <p>12.3. Paid Services may include subscriptions, premium features, property documentation packages, builder onboarding, project-level services, additional storage or other offerings.</p>
              <p>12.4. Applicable prices, taxes, billing periods, service scope and payment terms will be disclosed before the User commits to a Paid Service or will be set out in a separate written agreement.</p>
              <p>12.5. Unless expressly stated otherwise, prices are exclusive of applicable GST and other statutory taxes.</p>
              <p>12.6. Users agree to pay the charges applicable to the services they purchase.</p>
              <p>12.7. Payments may be processed through third-party payment gateways or service providers. Their applicable terms and privacy practices may also apply.</p>
              <p>12.8. Any recurring subscription, automatic renewal or recurring payment arrangement will be subject to the terms disclosed to the User at the time of purchase and applicable law.</p>
              <p>12.9. Refunds, cancellations and service credits will be governed by the applicable purchase terms, separate commercial agreement and applicable consumer protection laws.</p>
              <p>12.10. SpaceScanner will not impose undisclosed charges or materially change an agreed paid-service price without appropriate disclosure and, where required, the User's consent.</p>
              <p>12.11. SpaceScanner reserves the right to revise its pricing for future purchases or renewals, with reasonable prior notice where required.</p>

              <h2 id="acceptable-use">13. Acceptable Use</h2>
              <p>Users agree not to:</p>
              <ol>
                <li>Use the Platform for unlawful, fraudulent or misleading activities.</li>
                <li>Upload malicious code, viruses or harmful files.</li>
                <li>Attempt unauthorized access to accounts, systems, databases or property records.</li>
                <li>Interfere with the security, integrity or availability of the Platform.</li>
                <li>Copy, scrape, extract or commercially exploit Platform data without authorization.</li>
                <li>Upload content that infringes intellectual property, privacy or other legal rights.</li>
                <li>Upload false, defamatory, abusive, discriminatory or otherwise unlawful content.</li>
                <li>Misuse another person's identity or credentials.</li>
                <li>Manipulate or misuse QR Codes or access permissions.</li>
                <li>Use the Platform in a manner that could damage SpaceScanner, other Users or third parties.</li>
              </ol>
              <p>SpaceScanner may investigate suspected violations and take appropriate action, including restricting access, removing content or reporting unlawful activity to the relevant authorities where required.</p>

              <h2 id="third-party">14. Third-Party Products and Services</h2>
              <p>14.1. The Platform may contain information relating to products, manufacturers, vendors, contractors, service providers or other third parties.</p>
              <p>14.2. The presence of third-party information on SpaceScanner does not automatically mean that SpaceScanner endorses, certifies or guarantees the relevant product or service.</p>
              <p>14.3. Product warranties, manufacturer commitments, installation guarantees and service obligations remain subject to the relevant third party's terms and policies.</p>
              <p>14.4. SpaceScanner is not responsible for the performance, quality, availability or conduct of independent third-party providers, except to the extent responsibility is imposed on SpaceScanner under applicable law or an express written agreement.</p>
              <p>14.5. Where the Platform links to third-party websites or services, Users access them at their own discretion and subject to the relevant third party's terms.</p>

              <h2 id="availability">15. Platform Availability and Technical Limitations</h2>
              <p>15.1. SpaceScanner aims to maintain a reliable Platform but does not guarantee uninterrupted, error-free or continuous availability.</p>
              <p>15.2. Access may be temporarily affected by maintenance, updates, network failures, hosting issues, cyber incidents, third-party service interruptions or circumstances beyond SpaceScanner's reasonable control.</p>
              <p>15.3. Certain features may require compatible devices, operating systems, internet connectivity or third-party services.</p>
              <p>15.4. SpaceScanner may update, modify or discontinue features to improve the Platform, maintain security or comply with applicable requirements.</p>
              <p>15.5. Users are encouraged to maintain independent copies of important property documents and records.</p>
              <p>15.6. SpaceScanner will take reasonable steps to protect stored information and restore services following technical disruptions, but cannot guarantee that data loss or service interruptions will never occur.</p>

              <h2 id="disclaimers">16. Disclaimers</h2>
              <p>16.1. SpaceScanner is a digital documentation and property information platform. Unless expressly agreed in writing, it is not a construction company, structural auditor, legal title verification agency, engineering certification authority or statutory approval body.</p>
              <p>16.2. Information stored on the Platform is generally provided by Users or third parties. SpaceScanner does not guarantee that all such information is accurate, complete, current or independently verified.</p>
              <p>16.3. A Property Record must not be treated as a substitute for professional inspection, engineering advice, legal due diligence, statutory certification or manufacturer instructions.</p>
              <p>16.4. Users should consult appropriately qualified professionals before making decisions involving construction, structural safety, electrical systems, plumbing, repairs, renovations, warranties or legal ownership.</p>
              <p>16.5. SpaceScanner does not guarantee that a property will be free from defects, damage, maintenance issues or safety risks because it has a Digital Property Record.</p>
              <p>16.6. Nothing in these Terms excludes any guarantee, right or remedy that cannot legally be excluded under applicable law.</p>

              <h2 id="liability">17. Limitation of Liability</h2>
              <p>17.1. To the maximum extent permitted by applicable law, SpaceScanner will not be liable for indirect, incidental, special or consequential losses, including loss of profits, business opportunities, anticipated savings or goodwill arising from use of the Platform.</p>
              <p>17.2. SpaceScanner will not be responsible for losses arising from inaccurate, incomplete or outdated information submitted by Users or third parties, unauthorized sharing by Users, or independent third-party products and services, except where such loss is attributable to SpaceScanner's breach of applicable law or its own obligations.</p>
              <p>17.3. To the maximum extent permitted by law, SpaceScanner's aggregate contractual liability arising from a particular Paid Service will not exceed the amount paid by the affected User to SpaceScanner for that specific Paid Service during the twelve (12) months immediately preceding the event giving rise to the claim.</p>
              <p>17.4. This limitation does not apply where such limitation is prohibited by law. It does not exclude liability for fraud, wilful misconduct, or any other liability that cannot lawfully be excluded or limited.</p>
              <p>17.5. Nothing in this section limits statutory consumer rights or remedies available under applicable Indian law.</p>

              <h2 id="indemnification">18. Indemnification</h2>
              <p>To the extent permitted by applicable law, Users agree to indemnify and hold SpaceScanner, its directors, employees and representatives harmless against third-party claims, losses and reasonable expenses arising directly from:</p>
              <ol>
                <li>The User's unlawful conduct or material breach of these Terms.</li>
                <li>Content uploaded or submitted by the User that infringes another person's rights.</li>
                <li>The User's unauthorized disclosure or sharing of personal or confidential information.</li>
                <li>The User's misuse of the Platform or QR Code.</li>
                <li>A material misrepresentation by the User regarding property ownership, authority or permission to share information.</li>
              </ol>
              <p>This clause does not apply to the extent a claim arises from SpaceScanner's own breach of law, negligence, wilful misconduct or other conduct for which liability cannot legally be transferred to the User.</p>

              <h2 id="termination">19. Suspension and Termination</h2>
              <p>19.1. Users may stop using the Platform and may request account closure in accordance with the applicable account and Privacy Policy procedures.</p>
              <p>19.2. SpaceScanner may suspend or restrict access where reasonably necessary to:</p>
              <ul>
                <li>Prevent fraud, unauthorized access or security risks.</li>
                <li>Investigate a suspected breach of these Terms.</li>
                <li>Comply with applicable law or a lawful direction.</li>
                <li>Protect the Platform, Users or third parties.</li>
              </ul>
              <p>19.3. Where reasonably practicable and legally permissible, SpaceScanner will provide notice and an opportunity to address the issue before taking action.</p>
              <p>19.4. Termination or account closure does not automatically require deletion of all information where retention is necessary or permitted under applicable law, contractual obligations, dispute resolution or legitimate record-keeping requirements.</p>
              <p>19.5. Users may request deletion of their personal data or account information in accordance with the Privacy Policy and applicable law.</p>
              <p>19.6. Clauses relating to intellectual property, data rights, payment obligations, disclaimers, liability, indemnification and dispute resolution will survive termination to the extent applicable.</p>

              <h2 id="grievance">20. Grievance Redressal</h2>
              <p>Users may contact SpaceScanner to report complaints, concerns, suspected misuse, data-related issues or grievances.</p>
              <p><strong>Grievance Officer:</strong> [Insert name]<br />
              <strong>Designation:</strong> [Insert designation]<br />
              <strong>Email:</strong> [Insert grievance email]<br />
              <strong>Postal Address:</strong> [Insert registered office address]<br />
              <strong>Contact Number:</strong> [Insert contact number]<br />
              <strong>Working Hours:</strong> [Insert working hours]</p>
              <p>SpaceScanner will acknowledge and address grievances within the timelines prescribed by applicable law.</p>
              <p>Where a specific statutory grievance or data-protection process applies, the applicable statutory procedure and timeline will prevail.</p>

              <h2 id="changes">21. Changes to These Terms</h2>
              <p>SpaceScanner may update these Terms from time to time to reflect changes in the Platform, business operations, technology or applicable law.</p>
              <p>The updated version will be published on the website or made available through the mobile application, along with its revised effective date.</p>
              <p>Where a change materially affects Users' rights or obligations, SpaceScanner will provide notice through an appropriate communication channel where required by law.</p>
              <p>Continued use of the Platform after the revised Terms become effective will constitute acceptance where such acceptance is legally valid. Where affirmative consent is required, SpaceScanner will seek it.</p>

              <h2 id="law">22. Governing Law and Jurisdiction</h2>
              <p>These Terms are governed by the laws of India.</p>
              <p>Subject to applicable consumer protection laws, statutory remedies and the jurisdiction of relevant authorities or tribunals, courts having competent jurisdiction in Nashik, Maharashtra, shall have jurisdiction over disputes arising from these Terms.</p>
              <p>Nothing in this clause restricts a consumer from approaching a consumer commission or other forum that has jurisdiction under applicable law.</p>

              <h2 id="force-majeure">23. Force Majeure</h2>
              <p>SpaceScanner will not be responsible for delay or failure to perform obligations to the extent caused by events beyond its reasonable control, including natural disasters, floods, fire, war, civil unrest, government restrictions, power or internet failures, cyber incidents, strikes or disruptions to third-party infrastructure.</p>
              <p>SpaceScanner will take reasonable steps to mitigate the impact and resume affected services when practicable.</p>

              <h2 id="severability">24. Severability</h2>
              <p>If any provision of these Terms is held invalid, unlawful or unenforceable, that provision will be limited or severed to the minimum extent necessary. The remaining provisions will continue in effect.</p>

              <h2 id="entire-agreement">25. Entire Agreement and Separate Agreements</h2>
              <p>These Terms, together with the Privacy Policy and any applicable service-specific terms or written agreements, constitute the agreement governing use of the Platform.</p>
              <p>Where a separate written agreement with a Builder, Developer, Vendor or other business User contains specific commercial or operational terms, that agreement will prevail over these Terms to the extent of any direct inconsistency relating to that specific service or relationship.</p>

              <h2 id="contact">26. Contact SpaceScanner</h2>
              <p>For questions, feedback or assistance regarding these Terms or the Platform, please contact:</p>
              <p><strong>Home Scanner Technologies Private Limited</strong><br />
              Website: [Insert official website URL]<br />
              Email: [Insert official contact email]<br />
              Registered Office: [Insert registered office address]<br />
              Phone: [Insert official contact number]</p>

              <div className="mt-16 rounded-2xl border border-line bg-white/50 p-8 text-center backdrop-blur-sm">
                <p className="text-lg font-medium text-ink">SpaceScanner — The Digital Passport of Your Space.</p>
                <p className="mt-2 text-sm text-muted">By using SpaceScanner, you acknowledge that you have read and understood these Terms and agree to comply with them.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}