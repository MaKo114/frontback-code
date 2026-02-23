import { Link, useNavigate } from "react-router-dom";
import { Home, Bell, MessageCircle, User, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

// rafce
const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-background">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-8 bg-gradient-to-r from-amber-400 to-orange-400 shadow-md">
        

          <span className="text-lg font-bold text-white">Home page</span>
          
          <div className="flex items-center gap-3">
            <Link to="/home" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm hover:bg-white transition">
              <Home size={18} />
            </Link>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm hover:bg-white transition">
              <Bell size={18} />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm hover:bg-white transition">
              <MessageCircle size={18} />
            </button>

            {/* Person icon with dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm hover:bg-white transition">
                  <User size={18} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover">
                <DropdownMenuItem
                  onClick={() => navigate("/my-posts")}
                  className="cursor-pointer gap-2"
                >
                  <User size={16} />
                  <span>นมศักดิ์ มาโล</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("my-posts")}
                  className="cursor-pointer gap-2"
                >
                  <Pencil size={16} />
                  <span>โพสต์ทั้งหมดของฉัน</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/register")}
                  className="cursor-pointer gap-2 text-destructive"
                >
                  <span>ออกจากระบบ</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        {/* </div> */}
      </header>
    </nav>
  );
};

export default Navbar;
