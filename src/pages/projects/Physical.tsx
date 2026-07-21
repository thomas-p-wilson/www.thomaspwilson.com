import { Wrench } from "lucide-react";
import SimpleProjectListPage from "./SimpleProjectListPage";
import { physicalProjects } from "@/data/physical-projects";

export default function Physical() {
  return (
    <SimpleProjectListPage
      title="Physical"
      titleAccent="Projects"
      description="Hardware builds and things made with hands rather than just code."
      icon={Wrench}
      items={physicalProjects}
      emptyMessage="Nothing published here yet — check back soon."
    />
  );
}
