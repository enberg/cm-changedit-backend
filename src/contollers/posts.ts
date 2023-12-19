import { Request, Response } from "express";
import Post from "../models/Post";
import { assertDefined } from "../util/asserts";

export const create = async (req: Request, res: Response) => {
    assertDefined(req.userId);
    const { title, link, body } = req.body;

    const post = new Post({
        title,
        link,
        body,
        author: req.userId
    })

    try {
        const savedPost = await post.save();
        res.status(201).json(savedPost);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to create post' });
    }
}

export const getAllPosts = async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit?.toString() || '5');
    const page = parseInt(req.query.page?.toString() || '1')

    if (isNaN(page) || isNaN(limit)) {
        res.status(400).json({ message: 'Malformed query object number: ' + req.query.toString() })
    }

    // const posts = await Post
    //     .find({}, '-comments')
    //     .sort({ score: 'descending' })
    //     .limit(limit)
    //     .skip(limit * (page - 1))
    //     .populate("author", "userName");
    const posts = await Post.aggregate([
        {
            $addFields: { // 8: Spara resultatet som sortValue på varje post
                sortValue: {
                    $divide: [ // 7: Dividera resultatet av steg 6 med steg 4
                        { $add: [ // 6: Addera 1 till score
                            { $ifNull: ["$score", 0] }, // 5: Om score inte finns, använd 0
                            1
                        ] },
                        {
                            $pow: [ // 4: Upphöj till 1.5
                                {
                                    $add: [ // 3: Addera 1 till timmar sen inlägg skapades
                                        1,
                                        {
                                            $divide: [ // 2: Dividera tid sen inlägg skapades med 1000 (till sekunder), 60 (till minuter) och 60 (till timmar)
                                                { $subtract: [new Date(), "$createdAt"] }, // 1: Räkna ut tid sen inlägg skapades i millisekunder (nu minus createdAt)
                                                1000 * 60 * 60
                                            ]
                                        }
                                    ]
                                },
                                1.5
                            ]
                        }
                    ]
                }
            }
        },
        {
            $sort: { sortValue: -1 } // Sortera i fallande ordning
        },
        { $skip: limit * (page - 1) }, // Hoppa över sidor
        { $limit: limit }, // Välj x antal post
        {
            $addFields: { // 3: Lägg till resultatet som commentCount på de posts vi valt
                commentCount: {
                    $size: { // 2: Räkna ut storleken på comments (som comments.length)
                        $ifNull: ["$comments", []] // 1: Om comments inte finns använd tom array
                    }
                }
            }
        },
        {
            $lookup: { // Gör en lookup från en annan collection
                from: 'users', // Sök i users
                localField: 'author', // Använd värdet från author på varje vald post
                foreignField: '_id', // Sök i users på fältet _id
                pipeline: [ // Kör denna pipeline över de användare vi hittat
                    {
                        $project: { // Välj userName från användaren
                            userName: 1
                        }
                    }
                ],
                as: 'author' // Spara resultatet som author på varje vald post
            },
        },
        { $unwind: '$author' }, // Resultatet av en lookup är en array, vi kör unwind för att "reducera" den till ett element
        {
            $project: { // För varje vald post projicera följande fält
                _id: 1,
                title: 1,
                link: 1,
                body: 1,
                createdAt: 1,
                updatedAt: 1,
                score: 1,
                commentCount: 1,
                author: 1
            }
        },
    ]);

    const totalCount = await Post.countDocuments();

    res.status(200).json({
        posts,
        totalPages: Math.ceil(totalCount/limit),
    })
}

export const getPost = async (req: Request, res: Response) => {
    const { id } = req.params;

    const post = await Post.findById(id)
     .populate("author")
     .populate("comments.author");

    if (!post) {
        return res.status(404).json({message: 'No post found for id: ' + id})
    }

    res.status(200).json(post)
}