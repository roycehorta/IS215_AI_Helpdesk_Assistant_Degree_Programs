import { fetchS3Context }       from './src/service/FetchS3Context.mjs';

export const handler = async (event) => {

    // 4. Fetch S3 Context
    const s3Context = await fetchS3Context(keywords);
    console.log("S3 Context found:", s3Context);

}
