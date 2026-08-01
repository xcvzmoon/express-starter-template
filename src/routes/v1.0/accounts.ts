import createBaseRouter from '../../utilities/base-router';
import Account from '../../models/public/account.model';

const accountRouter = createBaseRouter(Account, {
});

export default accountRouter;
