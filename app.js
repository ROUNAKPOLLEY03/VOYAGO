import express from 'express';
import morgan from 'morgan';
import { router as tourRouter } from './routes/tour.route.js';
import { router as userRouter } from './routes/user.route.js';
import { router as reviewRouter } from './routes/review.route.js';
import { router as viewRouter } from './routes/view.route.js';
import { router as bookingRouter } from './routes/booking.route.js';
import ApiError from './utils/ApiError.js';
import { globalErrorHandler } from './controllers/error.controller.js';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';

const app = express();

app.set('view engine', 'pug');
app.set('views', './views');

app.use(cors());
app.options('*', cors());

// Serving static files
app.use(express.static('./public'));

// Enable Helmet middleware for security
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://js.stripe.com'],
      frameSrc: ["'self'", 'https://js.stripe.com'], // Required for Stripe checkout
      connectSrc: ["'self'", 'https://api.stripe.com'], // Required for API calls
    },
  }),
);

// Limit requests from same API
const globalRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 15, // Limit each IP to 15 requests per windowMs
  message: 'Too many requests from this IP, please try again after 60 minutes.',
  standardHeaders: true, // Send rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

app.use('/api', globalRateLimiter);

// Middlewares
app.use(morgan('dev'));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NOSQL query injection
app.use(ExpressMongoSanitize());
// Data sanitization against XSS (cross-site scripting attacks)
app.use(xss());
// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
      'ratingsAverage',
    ],
  }),
);

app.use(compression());

app.use((req, res, next) => {
  req.requestedAt = new Date().toISOString();
  next();
});

// Route Handlers

// Routes: Mounting the routes
// view
app.use('/', viewRouter);
// backend
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new ApiError(`can't find ${req.originalUrl} on this server!`), 404);
});

app.use(globalErrorHandler);

export default app;
