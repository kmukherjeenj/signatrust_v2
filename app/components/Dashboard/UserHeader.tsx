import React from 'react';
import { UserData } from '../../shared/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { LogOut, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';

interface UserHeaderProps {
  user: UserData;
  onLogout: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="flex justify-between items-center py-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src="/images/default-avatar.png" alt={`${user.name}'s avatar`} />
          <AvatarFallback>{user.name ? user.name.charAt(0) : 'U'}</AvatarFallback>
        </Avatar>
        <span className="hidden md:inline">{user.name}</span>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                <Button onClick={onLogout} className="w-full mt-4">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
        <Button onClick={onLogout} className="hidden md:flex">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
    </header>
  );
};

export default UserHeader;