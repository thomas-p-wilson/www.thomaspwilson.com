import { Gamepad2 } from "lucide-react";
import SimpleProjectListPage from "./SimpleProjectListPage";
import { gamingProjects } from "@/data/gaming-projects";

export default function Gaming() {
  return (
    <SimpleProjectListPage
      title="Gaming & Misc"
      titleAccent="Projects"
      description="Games worth tinkering with, plus interactive odds and ends that didn't fit anywhere else."
      icon={Gamepad2}
      items={gamingProjects}
      emptyMessage="Nothing published here yet — check back soon."
      basePath="/projects/gaming"
    />
  );
}
