'use client';

import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { AdminUser } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import Link from 'next/link';

export function UsersTable({ users }: { users: AdminUser[] }) {

  if (users.length === 0) {
    return (
        <div className="text-center py-16 border rounded-lg">
            <h2 className="text-2xl font-bold font-headline">No users found</h2>
            <p className="text-muted-foreground mt-2">
                It looks like no users have registered yet.
            </p>
        </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Seen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.uid}>
              <TableCell>
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={user.photoURL} alt={user.displayName} />
                        <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.displayName}</span>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {format(new Date(user.creationTime), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                 <Badge variant="outline" className="text-slate-400">Offline</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                N/A
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
