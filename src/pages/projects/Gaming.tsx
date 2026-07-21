import { Gamepad2 } from "lucide-react";
import SimpleProjectListPage from "./SimpleProjectListPage";
import { gamingProjects } from "@/data/gaming-projects";

export default function Gaming() {
  return (
    <SimpleProjectListPage
      title="Gaming"
      titleAccent="Projects"
      description="Tools, mods, and save-file tinkering for games worth tinkering with."
      icon={Gamepad2}
      items={gamingProjects}
      emptyMessage="Nothing published here yet — check back soon."
    />
  );
}
