import React from 'react';
import mobx from 'mobx';
import { observer } from 'mobx-react';

class ObserverComponent extends React.Component {
	static observer(...args) {
		return observer(...args);
	}

	static untracked(...args) {
		return mobx.untracked(...args);
	}

	static autorun(...args) {
		return mobx.autorun(...args);
	}

	static observe(...args) {
		return mobx.observe(...args);
	}

	static intercept(...args) {
		return mobx.intercept(...args);
	}
}

export default observer(ObserverComponent);