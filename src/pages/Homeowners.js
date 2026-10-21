import PageTemplate from "../components/PageTemplate";

export default function Homeowners() {
  return (
    <PageTemplate
      title="Everything about your home, in your pocket."
      intro="Scan the QR code at your property to open its full record: what it's made of, what's covered, and what needs care next."
      points={[
        ["Know your home", "See every material, appliance and installation in one place."],
        ["Never miss a reminder", "Get notified before warranties expire or servicing is due."],
        ["Save time and money", "Find the right document fast and avoid unnecessary repairs."],
        ["Built to last", "Keep a clear history that adds confidence when you sell."],
      ]}
      closing="Ask your builder about HomeScanner."
    />
  );
}
