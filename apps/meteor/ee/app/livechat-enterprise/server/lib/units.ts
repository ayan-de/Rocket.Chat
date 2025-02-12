import { Meteor } from 'meteor/meteor';
import mem from 'mem';

import LivechatUnit from '../../../models/server/models/LivechatUnit';

function hasUnits(): boolean {
	// @ts-expect-error - this prop is injected dynamically on ee license
	return LivechatUnit.unfilteredFind({ type: 'u' }).count() > 0;
}

// Units should't change really often, so we can cache the result
const memoizedHasUnits = mem(hasUnits, { maxAge: 5000 });

export async function getUnitsFromUser(): Promise<{ [k: string]: any }[] | undefined> {
	if (!memoizedHasUnits()) {
		return;
	}

	return Meteor.callAsync('livechat:getUnitsFromUser');
}
