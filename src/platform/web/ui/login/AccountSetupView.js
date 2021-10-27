/*
Copyright 2020 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import {TemplateView} from "../general/TemplateView";

export class AccountSetupView extends TemplateView {
    render(t, vm) {
        const keyLabel = vm => `Dehydration key for device ${vm.dehydratedDeviceId}`;
        const password = t.input({
            id: "dehydrated_device_key",
            type: "password",
            placeholder: keyLabel,
        });
        const status = t.output({for: password.id}, vm => vm.deviceDecrypted ? "Key matches, good to go!" : "");
        return t.div({className: "form"}, [
            t.form({
                onSubmit: evt => {
                    evt.preventDefault();
                    vm.tryDecryptDehydratedDevice(password.value);
                }
            }, [
                t.div({ className: "form-row" }, [t.label({ for: password.id }, keyLabel), password, status]),
            ]),
            t.div({ className: "button-row" }, [
                t.button({
                    className: "button-action primary",
                    onClick: () => { vm.finish(); },
                    type: "button",
                }, vm.i18n`Continue`),
            ]),
        ]);
    }
}
