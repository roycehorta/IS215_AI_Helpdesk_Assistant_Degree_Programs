import { getUserQuestion }      from './src/service/GetUserQuestionService.mjs';

import { extractKeywords }      from './src/service/ExtractKeywordsService.mjs';
import { fetchS3Context }       from './src/service/FetchS3Context.mjs';




export const handler = async (event) => {
    // 1. Get User Question
        const {userQuestion, chatHistory} = await getUserQuestion(event);
        console.log("User Question:", userQuestion);
    

    
    // 3.Extract Keywords
    const keywords = await extractKeywords(searchTarget);
    console.log("Extracted Keywords:", keywords);


    // 4. Fetch S3 Context
    const s3Context = await fetchS3Context(keywords);
    console.log("S3 Context found:", s3Context);

}
