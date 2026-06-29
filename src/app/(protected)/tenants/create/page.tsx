'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { searchUsers } from '@/api/admin/users';
import type { AdminUser } from '@/api/admin/users/types';
import { createTenant } from '@/api/admin/tenants';
import { AsyncCombobox } from '@/components/common/AsyncCombobox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { APP_ROUTES } from '@/constants/routes';

type OwnerMode = 'existing' | 'new';

interface FormInputs {
  name: string;
  is_personal: boolean;
  trial_days: number;
  owner_id: string;
  owner_firstname: string;
  owner_lastname: string;
  owner_email: string;
}

export default function CreateTenantPage() {
  const router = useRouter();
  const [ownerMode, setOwnerMode] = useState<OwnerMode>('existing');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<FormInputs>({
    defaultValues: {
      is_personal: false,
      trial_days: 14,
    },
  });

  const handleUserChange = (user: AdminUser | null) => {
    setSelectedUser(user);
    setValue('owner_id', user?.id ?? '');
  };

  const onSubmit = async (data: FormInputs) => {
    try {
      if (ownerMode === 'existing') {
        if (!data.owner_id) {
          toast.error('Please select an existing user.');
          return;
        }
        await createTenant({
          name: data.name,
          is_personal: data.is_personal,
          trial_days: data.trial_days,
          owner_id: data.owner_id,
        });
      } else {
        await createTenant({
          name: data.name,
          is_personal: data.is_personal,
          trial_days: data.trial_days,
          owner: {
            firstname: data.owner_firstname,
            lastname: data.owner_lastname,
            email: data.owner_email,
          },
        });
      }
      toast.success('Tenant created successfully.');
      router.push(APP_ROUTES.TENANTS);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create tenant.');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={APP_ROUTES.TENANTS}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold">Create Tenant</h1>
        <p className="text-muted-foreground text-sm mt-1">Create a new workspace and assign an owner.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Workspace</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Acme Corp"
                {...register('name', { required: 'Name is required.' })}
              />
              {errors.name && (
                <p className="text-destructive text-xs">{errors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="trial_days">Trial Days</Label>
              <Input
                id="trial_days"
                type="number"
                min={0}
                {...register('trial_days', { valueAsNumber: true })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="is_personal"
                onCheckedChange={(checked) => setValue('is_personal', !!checked)}
              />
              <Label htmlFor="is_personal">Personal workspace</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Owner</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setOwnerMode('existing');
                  handleUserChange(null);
                }}
                className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                  ownerMode === 'existing'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:bg-muted'
                }`}
              >
                Existing User
              </button>
              <button
                type="button"
                onClick={() => {
                  setOwnerMode('new');
                  handleUserChange(null);
                }}
                className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                  ownerMode === 'new'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:bg-muted'
                }`}
              >
                New User
              </button>
            </div>

            {ownerMode === 'existing' && (
              <div className="flex flex-col gap-1.5">
                <Label>User</Label>
                <AsyncCombobox<AdminUser>
                  value={selectedUser}
                  onChange={handleUserChange}
                  search={(query) => searchUsers(query).then((res) => res.data)}
                  getOptionValue={(user) => user.id}
                  renderOption={(user) => (
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {user.firstname} {user.lastname}
                      </span>
                      <span className="text-muted-foreground text-xs">{user.email}</span>
                    </div>
                  )}
                  renderValue={(user) => (
                    <>
                      {user.firstname} {user.lastname}
                      <span className="text-muted-foreground"> — {user.email}</span>
                    </>
                  )}
                  placeholder="Select a user..."
                  searchPlaceholder="Search by name or email..."
                  emptyMessage="No users found."
                  idleMessage="Type to search users."
                />
                <input type="hidden" {...register('owner_id')} />
              </div>
            )}

            {ownerMode === 'new' && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="owner_firstname">First Name</Label>
                    <Input
                      id="owner_firstname"
                      placeholder="Jane"
                      {...register('owner_firstname', { required: 'First name is required.' })}
                    />
                    {errors.owner_firstname && (
                      <p className="text-destructive text-xs">{errors.owner_firstname.message}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="owner_lastname">Last Name</Label>
                    <Input
                      id="owner_lastname"
                      placeholder="Doe"
                      {...register('owner_lastname', { required: 'Last name is required.' })}
                    />
                    {errors.owner_lastname && (
                      <p className="text-destructive text-xs">{errors.owner_lastname.message}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="owner_email">Email</Label>
                  <Input
                    id="owner_email"
                    type="email"
                    placeholder="jane@example.com"
                    {...register('owner_email', { required: 'Email is required.' })}
                  />
                  {errors.owner_email && (
                    <p className="text-destructive text-xs">{errors.owner_email.message}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Tenant'}
          </Button>
        </div>
      </form>
    </div>
  );
}
