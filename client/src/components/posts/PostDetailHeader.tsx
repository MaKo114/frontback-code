import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Clock, Trash2 } from "lucide-react";

interface Props {
  post: any;
  isAdmin: boolean;
  onDelete: () => void;
}

const PostDetailHeader = ({ post, isAdmin, onDelete }: Props) => {
  return (
    <div className="p-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11 border-2 border-orange-50 overflow-hidden shadow-sm">
          {post.profile_img ? (
            <img src={post.profile_img} alt="profile" className="w-full h-full object-cover" />
          ) : (
            <AvatarFallback className="bg-orange-50 text-[#FF5800] font-black text-xl uppercase">
              {post.first_name?.[0] || <User size={20} />}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <p className="font-black text-gray-900 leading-tight">
            {post.first_name} {post.last_name}
          </p>
          <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-wider">
            <Clock size={12} /> {new Date(post.created_at).toLocaleDateString("th-TH")}
          </p>
        </div>
      </div>

      {isAdmin && (
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors text-xs font-black"
        >
          <Trash2 size={14} /> ลบโพสต์นี้
        </button>
      )}
    </div>
  );
};

export default PostDetailHeader;