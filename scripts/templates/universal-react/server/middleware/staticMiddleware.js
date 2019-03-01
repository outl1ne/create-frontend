import express from 'express';

export default express.static('public', {
  maxAge: 604800000,
  etag: false,
});
