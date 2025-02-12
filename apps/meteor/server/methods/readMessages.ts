import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import type { ServerMethods } from '@rocket.chat/ui-contexts';
import type { IUser } from '@rocket.chat/core-typings';

import { readMessages } from '../lib/readMessages';
import { canAccessRoomAsync } from '../../app/authorization/server';
import { Rooms } from '../../app/models/server';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		readMessages(rid: string, readThreads?: boolean): Promise<void>;
	}
}

Meteor.methods<ServerMethods>({
	async readMessages(rid, readThreads = false) {
		check(rid, String);

		const userId = Meteor.userId();
		if (!userId) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'readMessages',
			});
		}

		const user = ((await Meteor.userAsync()) as IUser | null) ?? undefined;
		const room = Rooms.findOneById(rid);
		if (!room) {
			throw new Meteor.Error('error-room-does-not-exist', 'This room does not exist', { method: 'readMessages' });
		}
		if (!(await canAccessRoomAsync(room, user))) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'readMessages' });
		}

		await readMessages(rid, userId, readThreads);
	},
});
