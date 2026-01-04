import nodemailer from 'nodemailer';
import { mailConfig } from '../config/mail.config.mjs';
import templates from '../utils/templates.mjs';
import { normalizeError } from '../utils/Error.mjs';

let mail = false;

const transporter = nodemailer.createTransport(mailConfig);

async function sendEmail(option) {
    try {
        return await transporter.sendMail(option);
    } catch (error) {
        throw normalizeError(error,{layer:"layer.service",event:"event.mail.sendEmail"})
    }
}

class Mail {
    constructor() {
        this.templates = [];
        this.failStore = [];
        this.maxTry = 3;
        this.store = [];
        this.isFlushing = false;

        //binding
        this.addTemplate = this.addTemplate.bind(this);
        this.send = this.send.bind(this);
        this.flushQueue= this.flushQueue.bind(this);
    }
    addTemplate(key, template) {
        this.templates[key] = template;
        return this;
    }
    async send(data,ctx) {
        const {to,key,params={}} = data;

        if (!this.templates[key]) return;
        const { sub, body } = this.templates[key];
        const html = Object.entries(params).reduce((acc, [k, v]) => {
            return acc.split(k).join(v);
        }, body);

        const option = {
            from: `Admin <admin@gmail.com>`,
            to,
            subject: sub,
            html,
            retryCount: 0
        };

        try {
            const info = await sendEmail(option);
            console.log(`Sent: ${info.messageId}`);
        } catch (error) {
            console.error(`X Send Error: ${error.code}  ${error.responseCode}`);
            // detect hard bounce
            if ([550, 552, 553, 554].includes(error.responseCode)) {
                console.log(`Hard bounce -> not retrying: ${option.to}`);
                this.failStore.push(option);
                return;
            }

            // retry if limit not exceeded
            if (option.retryCount < this.maxTry) {
                option.retryCount++;
                this.store.push(option);
                console.log(`Retrying (${option.retryCount}/${this.maxTry}: ${option.subject})`);
            } else {
                console.log(`Max retry reached -> moving to failedstore.`);
                this.failStore.push(option);
            }
        }
    }

    async flushQueue() {
        if (this.isFlushing) return;
        this.isFlushing = true;

        const pending = [...this.store];
        this.store = [];

        console.log(`Flushing ${pending.length} queued email....`);
        for (const option of pending) {
            try {
                const info = await sendEmail(option);
                console.log(`Queue sent: ${info.messageId}`);
            } catch (error) {
                console.error(`X Send Error: ${error.code}  ${error.responseCode}`);
                // detect hard bounce
                if ([550, 552, 553, 554].includes(error.responseCode)) {
                    console.log(`Hard bounce -> not retrying: ${option.to}`);
                    this.failStore.push(option);
                    return;
                }

                // retry if limit not exceeded
                if (option.retryCount < this.maxTry) {
                    option.retryCount++;
                    this.store.push(option);
                    console.log(`Retrying (${option.retryCount}/${this.maxTry}: ${option.subject})`);
                } else {
                    console.log(`Max retry reached -> moving to failedstore.`);
                    this.failStore.push(option);
                }
            }
        }
        this.isFlushing = false;
    }
}

export function getMail(){
    if(mail) return mail;
    mail = new Mail();
    Object.keys(templates).forEach(key=>mail.addTemplate(key,templates[key]));
    return mail;
}

export async function flushMail(){
    if(!mail) mail = getMail();
    mail.flushQueue();
}