import { fetchClient } from '@/api/fetchClient';
import { API_ROUTES } from '@/constants/api';
import Pusher, { type Channel } from 'pusher-js';
import { ChannelAuthorizationData } from 'pusher-js/src/core/auth/options';

export type PusherChannel = Channel;
type PusherClient = InstanceType<typeof Pusher>;

let pusherClient: PusherClient | null = null;

export const getPusherClient = () => {
  if (typeof window === 'undefined') return null;
  if (pusherClient) return pusherClient;

  const PusherConstructor = ((Pusher as unknown as { Pusher?: typeof Pusher }).Pusher ?? Pusher) as typeof Pusher;

  pusherClient = new PusherConstructor(process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '', {
    cluster: '',
    // Connect to our Websocket endpoint
    wsHost: process.env.NEXT_PUBLIC_PUSHER_HOST || '',
    wssPort: parseInt(process.env.NEXT_PUBLIC_PUSHER_PORT || ''),
    forceTLS: true,
    disableStats: true,

    // For private/presence channels with authentication
    authorizer: (channel) => {
      return {
        authorize: (socketId, callback) => {
          fetchClient<ChannelAuthorizationData>(API_ROUTES.BROADCASTING_AUTH, {
            method: 'POST',
            body: JSON.stringify({ socket_id: socketId, channel_name: channel.name }),
          })
            .then((response) => {
              callback(null, response);
            })
            .catch((error) => {
              callback(error, null);
            });
        },
      };
    },
  });

  return pusherClient;
};

export const getPusherSocketId = () => getPusherClient()?.connection?.socket_id;
