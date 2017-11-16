import _ from 'lodash';

/**
* This is a little helper intended to reduce duplication during action definition.
*
* Currently, when an action is to start an async operation we end up with the following duplication of names:
* Action -> something, somethingSuccess, somethingError
* Store -> something
* Source -> something: { ... }
* With success and error actions being fired when the async operation resolves/rejects. As a result we often add actions in triplets:
*
* this.generateActions(
*      'another',
*      'getUsers',
*      'getUsersSuccess',
*      'getUsersError',
*      'yetAnother'
* );
*
* Using this helper you end up with:
*
* this.generateActions(
*      'another',
*      ...asyncActions('getUsers'),
*      'yetAnother'
* );
*
*
* @param name the base action name
* @returns {string[]} an array of 3 service names following the convention
*/
export function asyncActions(name) {
   return [name, name + 'Success', name + 'Error'];
}

/**
* This is a helper intended for use with alt-source/remote definitions. As usually we do
* <code>
* {
*      ...
*      [`${name}`]: {
*          remote() { ... },
*          success: actions[`${name}Success`],
*          error: actions[`${name}Error`]
*      },
*      ...
* }
* </code>
* For each async action this helper reduces the repetition and avoid typos:
* <code>
* {
*      ...sourceMethod(name, actions, (state, ...args) => {...})
* }
* </code>
* The downside is that it uses ES7 object spread properties syntax
* (At the time of writing - Stage 2)
* https://github.com/sebmarkbage/ecmascript-rest-spread
*
* @param name
* @param actions
* @param remote
* @returns {{}}
*/
export function sourceMethod(name, actions, remote) {
   const RemoteActions = {
       success: actions[name + 'Success'],
       error: actions[name + 'Error']
   };

   if (typeof RemoteActions.success !== 'function' || typeof RemoteActions.error !== 'function') {
       throw new Error(`missing proper action method for handling async outcome for ${name}`);
   }

   return {
       [name]: {
           remote,
           success: RemoteActions.success,
           error: RemoteActions.error
       }
   };
}

/**
* @typedef ActionsSelection
* @param {Actions} from
* @param {Array.<String>} actions
*/

/**
* Expects a number of "selections" of action events to expose
* A selection has the form
* {
*   from: Actions
*   actions: ['doA', 'happenB']
* }
*
*
* @param {ActionsSelection} selections
* @returns {Function}
* @private
*/
export function selectActions(...selections) {
   return () => {
       const result = {};
       for (const selection of selections) {
           for (const action of selection.actions) {
               result[action] = (...args) => {
                   selection.from[action].defer(...args);
               };
           }
       }
       return result;
   };
}

/**
* @typedef StatesSelection
* @param {Store} from
* @param {Array.<String|Object>} states
*/

/**
* Expects a number of "selections" of store states to expose
* A selection can have one of the forms
* {
*   from: Store
*   states: ['items', 'current']
* }
* {
*   from: Store
*   states: [{ name: 'selectedItems', path: 'items.selected' }]
* }
* {
*   from: Store
*   states: [{ name: 'currentItem', method: 'getCurrentItem' }]
* }
* {
*   from: Store
*   states: [{ name: 'currentItem', method: Store.getCurrentItem }]
* }
*
* @param {StatesSelection} selections
* @returns {Object}
*/
export function selectStates(...selections) {
   const result = {};
   for (const selection of selections) {
       for (const state of selection.states) {
           let {name, path, method} = state;
           if (typeof state === 'string') {
               name = path = state;
           }

           if (method && typeof method === 'string') {
               if (!selection.from[method]) {
                   throw new Error(`missing proper store method for ${name}`)
               } else {
                   method = selection.from[method];
               }
           }

           result[name] = () => {
               return {
                   store: selection.from,
                   value: method ? method.apply(selection.from) : _.get(selection.from.getState(), path)
               };
           }
       }
   }
   return result;
}