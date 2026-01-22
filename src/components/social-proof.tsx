import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
import { User, Plus } from "lucide-react"

export function SocialProof({ count }: { count: number }) {
  const avatarColors = [
    "bg-foreground/90 text-background",
    "bg-foreground/75 text-background",
    "bg-foreground/60 text-background",
    "bg-foreground/45 text-background",
  ]

  return (
    <div className="flex items-center justify-center gap-3">
      <AvatarGroup className="-space-x-3">
        {avatarColors.map((colors, i) => (
          <Avatar key={i} className="size-10 border-2 border-background shadow-sm">
            <AvatarFallback className={colors}>
              <User className="size-4" />
            </AvatarFallback>
          </Avatar>
        ))}
        <AvatarGroupCount className="size-10 border-2 border-background shadow-sm bg-muted/80 text-muted-foreground">
          <Plus className="size-4" />
        </AvatarGroupCount>
      </AvatarGroup>
      <div className="text-sm font-medium text-muted-foreground">
        Loved by <span className="font-bold text-primary text-base"> {count}+ </span> athletes
      </div>
    </div>
  )
}
