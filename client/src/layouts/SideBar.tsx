import { Grid2x2 } from "lucide-react";
import CategoriesMenu from "@/components/categories/CategoriesMenu";

const SideBar = () => {
  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24 space-y-4">
        <div className="rounded-[24px] bg-white border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 text-[#FF5800]">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Grid2x2 size={20} />
            </div>
            <p className="font-bold tracking-tight">หมวดหมู่</p>
          </div>
          <div className="space-y-1">
            <CategoriesMenu />
          </div>
        </div>
        <div className="px-6 text-[11px] text-gray-400 font-medium">
          © 2026 TokLadkrabang • Community for Students
        </div>
      </div>
    </aside>
  );
};

export default SideBar;