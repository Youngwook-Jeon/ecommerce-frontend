import Container from "@/components/global/Container";

export default function Loading() {
  return <Container className="py-10"><p role="status" className="text-muted-foreground">Loading products...</p></Container>;
}
