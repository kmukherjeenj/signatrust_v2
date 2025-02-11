import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';
import { UserData } from '../../shared/types';
import { User } from 'lucide-react';

interface UserInfoCardProps {
  user: UserData;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({ user }) => {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>User Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Name: {user.name}</span>
          </div>
          <div className="flex items-center">
            <span className="font-mono text-sm">DID: {user.did}</span>
          </div>
          {user.email && (
            <div className="flex items-center">
              <span>Email: {user.email}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserInfoCard;