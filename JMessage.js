import {
    NativeModules,
    Platform,
    NativeEventEmitter,
} from 'react-native';
import Base64 from 'base-64';
import { requsetMediaURL } from './lib/restApi';
import camelcaseKeys from 'camelcase-keys';
import {cloneDeep, isEmpty} from 'lodash';

const JMessageModule = NativeModules.JMessageModule;

export default class JMessage {
    static eventEmitter = new NativeEventEmitter(JMessageModule);
    static appKey = JMessageModule.AppKey;
    static masterSecret = JMessageModule.MasterSecret;
    static authKey = Base64.encode(`${JMessageModule.AppKey}:${JMessageModule.MasterSecret}`);

    static events = {
        "onReceiveMessage": "onReceiveMessage",
    };

    static addReceiveMessageListener(cb) {
        return JMessage.eventEmitter.addListener('onReceiveMessage', (message) => {
            const _message = formatMessage(message);
            supportMessageMediaURL(_message).then((message) => cb(message));
        });
    }
    static removeAllListener(eventNames = Object.keys(JMessage.events)) {
        if (Array.isArray(eventNames)) {
            for ( eventName of eventNames) {
                JMessage.eventEmitter.removeAllListeners(eventName);
            }
        } else {
            JMessage.eventEmitter.removeAllListeners(eventNames);
        }
    }
    static init() {
        if (Platform.OS === 'android') {
            JMessageModule.setupJMessage();
        }
    }
    static isLoggedIn() {
        return JMessageModule.isLoggedIn();
    }
    static myInfo() {
        return JMessageModule.myInfo().then((info) => {
            const {avatar} = info;
            if(avatar) {
                return requsetMediaURL(JMessage.authKey, avatar).then((data) => {
                    return {...info, ...{avatar: data.url}};
                })
            } else {
                return info;
            }
        });
    }
    static login(username, password) {
        return JMessageModule.login(username, password).then((info) => {
            const {avatar} = info;
            if(avatar) {
                return requsetMediaURL(JMessage.authKey, avatar).then((data) => {
                    return {...info, ...{avatar: data.url}};
                })
            } else {
                return info;
            }
        });
    }
    static register(username, password) {
        return JMessageModule.register(username, password).then((info) => {
                return info;
        });
    }
    static async registerAndLogin(username, password){
        let loginInfo = {}
        try{
            loginInfo = await JMessage.login(username, password)
        }catch(err){
            console.log('err===aaaaaa',err.code)
            if(err.code==='801003'){
                try {
                    await JMessage.register(username, password)
                    return await JMessage.login(username, password)
                }catch (err){
                    throw err
                }
            }else{
                throw err
            }
        }


        return JMessageModule.login(username, password).then((info) => {
            const {avatar} = info;
            if(avatar) {
                return requsetMediaURL(JMessage.authKey, avatar).then((data) => {
                    return {...info, ...{avatar: data.url}};
                })
            } else {
                return info;
            }
        });
    }
    static logout() {
        return JMessageModule.logout();
    }
    static sendSingleMessage({name, type, data={}}) {
        return JMessageModule.sendSingleMessage(name, type, data)
            .then(message => formatMessage(message));
    }
    static sendGroupMessage({gid, type, data={}}) {
        return JMessageModule.sendGroupMessage(gid, type, data)
            .then(message => formatMessage(message));
    }
    static sendMessageByCID({cid, type, data={}}) {
        return JMessageModule.sendMessageByCID(cid, type, data)
            .then(message => formatMessage(message));
    }
    static allConversations() {
        return JMessageModule.allConversations();
    }
    static historyMessages(cid, offset=0, limit=0) {
        return JMessageModule.historyMessages(cid, offset, limit)
            .then(messages => Promise.all(messages.map((message) => {
                const _message = formatMessage(message);
                return supportMessageMediaURL(_message);
            })));
    }
    static clearUnreadCount(cid) {
        return JMessageModule.clearUnreadCount(cid);
    }
    static removeConversation(cid) {
        return JMessageModule.removeConversation(cid);
    }
    static toChatpage(userName,isSingle){
        return JMessageModule.toChatpage(userName,isSingle);
    }
}

const supportMessageMediaURL = (message) => {
    const {content = {}, from = {}, target = {}} = message;
    const requsetMediaURLPromise = mid => requsetMediaURL(JMessage.authKey, mid);
    return Promise
        .resolve(message)
        .then(message => requsetMediaURLPromise(from.avatar).then((data) => {
            message.from.mediaLink = data.url;
            return message;
        }).catch(() => message))
        .then(message => requsetMediaURLPromise(target.avatar).then((data) => {
            message.target.mediaLink = data.url;
            return message;
        }).catch(() => message))
        .then(message => requsetMediaURLPromise(content.mediaId).then((data) => {
            message.content.mediaLink = data.url;
            return message;
        }).catch(() => message));
};

const formatMessage = (message) => {
    const _message = cloneDeep(message)
    try {
        _message.content = JSON.parse(_message.content);
    } catch (ex) {
        _message.contentJSONString = _message.content;
        _message.content = {};
    }
    return camelcaseKeys(_message, {deep: true});
};