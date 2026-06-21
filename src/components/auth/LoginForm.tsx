'use client';

import { SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

import { getSession, login } from '@/api/auth';
import { getUser } from '@/api/auth/user';
import { ApiError } from '@/api/fetchClient';
import { useUser } from '@/providers/UserContext';
import { APP_ROUTES } from '@/constants/routes';

type Inputs = {
  email: string;
  password: string;
  remember?: boolean;
};

const LoginForm = () => {
  const router = useRouter();
  const { setUser } = useUser();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({ defaultValues: { remember: false } });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      await getSession();
      await login(data);
      const user = await getUser();
      setUser(user);
      router.push(APP_ROUTES.HOME);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Login failed. Please try again.');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground text-sm">Sign in to your ChatReach admin account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@example.com"
            autoComplete="email"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
            })}
          />
          {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            {...register('password', { required: 'Password is required' })}
          />
          {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="remember" onCheckedChange={(checked) => setValue('remember', checked === true)} />
          <Label htmlFor="remember" className="font-normal">Remember me</Label>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
