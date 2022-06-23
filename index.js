const { Readable } = require("stream");

module.exports.getUserImage = async (req, res) => {
  const { user_id: userId } = req.params;

  if (!userId) throw new CustomError(codes.BAD_REQUEST);

  const returndatabase = await DataApp.from("userparams")
    .where({ userId })
    .select("user_image");

  if (returndatabase.length == 0) throw new CustomError(codes.NOT_FOUND);

  streamBufferImage(res)(returndatabase[0].user_image);
};

const streamBufferImage = (responseStream) => (rawBuffer) => {
  // Case 1: Buffer of Base64 Image
  if (rawBuffer.toString().includes("base64")) {
    const base64Str = rawBuffer
      .toString()
      .replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Str, "base64");
    const stream = Readable.from(buffer);
    stream.pipe(responseStream);
    return;
  }

  // Case 2: Buffer of Blob Image
  const stream = Readable.from(rawBuffer);
  stream.pipe(responseStream);
};
