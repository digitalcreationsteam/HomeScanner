import PageTemplate from "../components/PageTemplate";

export default function Builders() {
  return (
    <PageTemplate
      title="A handover buyers remember."
      intro="Give every buyer a complete digital record of their home. HomeScanner turns handover into a lasting relationship built on transparency."
      points={[
        ["Professional handovers", "Share one organised passport instead of a folder of loose papers."],
        ["Fewer callbacks", "Buyers find manuals, warranties and service details on their own."],
        ["Stronger satisfaction", "Clear records build trust long after the keys change hands."],
        ["Records for every project", "Digitise each flat, floor and building in one dashboard."],
      ]}
      closing="See how your next handover could look."
    />
  );
}
