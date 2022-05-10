"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceProvider = void 0;
class ServiceProvider {
    constructor(boostrap) {
        this.boostrap = boostrap;
    }
    destroy() {
        return new Promise(resolve => resolve());
    }
}
exports.ServiceProvider = ServiceProvider;
//# sourceMappingURL=service_provider.js.map