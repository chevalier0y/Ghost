import Ember from 'ember';
import ajax from 'ghost/utils/ajax';
import ValidationEngine from 'ghost/mixins/validation-engine';

var SetupThreeController = Ember.Controller.extend(ValidationEngine, {
    users: null,
    numUsers: Ember.computed('users', function () {
        var userArray = [];
        if (this.get('users')) {
            userArray = this.get('users').split('\n');
        }

        return userArray.length;
    }),
    buttonText: Ember.computed('numUsers', function () {
        var user = this.get('numUsers') === 1 ? 'user' : 'users';
        return this.get('numUsers') > 0 ?
            'Invite ' + this.get('numUsers') + ' ' + user : 'I\'ll do this later, take me to my blog!';
    }),
    actions: {
        invite: function () {

            var usersArray = this.get('users').split('\n').filter(function (user) {
                return validator.isEmail(user);
            });

            console.log('inviting', usersArray);

            // do invites
            self.get('session').authenticate('simple-auth-authenticator:oauth2-password-grant', {
                identification: self.get('email'),
                password: self.get('password')
            });

        }
    }
});

export default SetupThreeController;
