'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface UserDropdownProps {
  user: {
    id: string;
    email?: string;
  } | null;
  profile?: {
    full_name?: string;
    avatar_url?: string;
    role?: string;
  } | null;
  showName?: boolean; // Show name next to avatar (desktop only)
}

export function UserDropdown({ user, profile, showName = false }: UserDropdownProps) {
  const router = useRouter();

  if (!user) {
    return (
      <Button variant="ghost" size="icon" asChild>
        <Link href="/login">
          <User className="h-5 w-5" />
          <span className="sr-only">Login</span>
        </Link>
      </Button>
    );
  }

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Generate initials from name or email
  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || user.email?.[0].toUpperCase() || 'U';

  // Display name: prefer full_name from profile, fallback to email without domain
  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User';
  const isAdmin = user?.user_metadata?.role === 'admin';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={`gap-2 ${showName ? 'px-2' : 'p-2'} text-white/90 hover:text-[#C5A572] hover:bg-white/10`}
          aria-label="User menu"
        >
          <Avatar className="h-8 w-8 border-2 border-[#C5A572]">
            <AvatarImage src={profile?.avatar_url} alt={displayName} />
            <AvatarFallback className="bg-[#C5A572] text-white text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {showName && (
            <span className="hidden md:inline-block text-sm font-medium text-white/90">
              {displayName}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer">
              <ShieldCheck className="mr-2 h-4 w-4" />
              <span>Admin Dashboard</span>
            </Link>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem 
          onClick={() => {
            window.location.href = '/profile#settings';
          }}
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
