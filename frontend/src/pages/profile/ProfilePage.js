import { useRef, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";

import { POSTS } from "../../utils/db/dummy";
import { baseUrl } from "../../constant/url";
import useFollow from "../../hooks/useFollow";

import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import useUpdateUserProfile from "../../hooks/useUpdateUserProfile";

const formatMemberSinceDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `Joined ${date.toLocaleString("default", {
        month: "long",
        year: "numeric",
    })}`;
};

const ProfilePage = () => {
    const [coverImg, setCoverImg] = useState(null);
    const [profileImg, setProfileImg] = useState(null);
    const [feedType, setFeedType] = useState("posts");

    const coverImgRef = useRef(null);
    const profileImgRef = useRef(null);

    const { username } = useParams();

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Assign autheticated user with the authUser object
    const { data: authUser } = useQuery({
        queryKey: ["authUser"],
        queryFn: async () => {
            const res = await fetch(`${baseUrl}/api/auth/me`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Something went wrong")
            }
            return data;
        }
    });

    const { updateProfile, isUpdatingProfile } = useUpdateUserProfile({ coverImg, profileImg });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`${baseUrl}/api/users/profile/${username}`, {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Something went wrong");
                setUser(data.user);
            } catch (error) {
                console.error(error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [username]);

    const isMyProfile = authUser?._id === user?._id;

    const { follow, isPending } = useFollow()
    const memberSinceDate = formatMemberSinceDate(user?.createdAt);
    const amIFollowing = authUser?.following.includes(user?._id);

    const handleImgChange = (e, state) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (state === "coverImg") setCoverImg(reader.result);
                if (state === "profileImg") setProfileImg(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className='flex-[4_4_0] border-r border-gray-700 min-h-screen'>
            {(isLoading) && <ProfileHeaderSkeleton />}
            {!isLoading && !user && <p className='text-center text-lg mt-4'>User not found</p>}

            {!isLoading && user && (
                <>
                    <div className='flex gap-10 px-4 py-2 items-center'>
                        <Link to='/'><FaArrowLeft className='w-4 h-4' /></Link>
                        <div className='flex flex-col'>
                            <p className='font-bold text-lg'>{user?.fullname}</p>
                            <span className='text-sm text-slate-500'>{POSTS?.length} posts</span>
                        </div>
                    </div>

                    {/* COVER IMAGE */}
                    <div className='relative group/cover'>
                        <img
                            src={coverImg || user?.coverImg || "/cover.png"}
                            className='h-52 w-full object-cover'
                            alt='Cover'
                        />
                        {isMyProfile && (
                            <div
                                className='absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200'
                                onClick={() => coverImgRef.current.click()}
                            >
                                <MdEdit className='w-5 h-5 text-white' />
                            </div>
                        )}

                        <input
                            type='file'
                            hidden
                            accept='image/*'
                            ref={coverImgRef}
                            onChange={(e) => handleImgChange(e, "coverImg")}
                        />
                        <input
                            type='file'
                            hidden
                            accept='image/*'
                            ref={profileImgRef}
                            onChange={(e) => handleImgChange(e, "profileImg")}
                        />

                        {/* PROFILE IMAGE */}
                        <div className='avatar absolute -bottom-16 left-4'>
                            <div className='w-32 rounded-full relative group/avatar'>
                                <img src={profileImg || user?.profileImg || "/avatar-placeholder.png"} alt='' />
                                {isMyProfile && (
                                    <div className='absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer'>
                                        <MdEdit className='w-4 h-4 text-white' onClick={() => profileImgRef.current.click()} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className='flex justify-end px-4 mt-5'>
                        {isMyProfile && <EditProfileModal authUser={authUser} />}
                        {!isMyProfile && (
                            <button className='btn btn-outline rounded-full btn-sm' onClick={() => {
                                follow(user?._id)
                            }}>
                                {isPending && <LoadingSpinner size="sm" />}
                                {!isPending && amIFollowing && "Unfollow"}
                                {!isPending && !amIFollowing && "Follow"}
                            </button>
                        )}
                        {(coverImg || profileImg) && (
                            <button
                                className='btn btn-primary rounded-full btn-sm text-white px-4 ml-2'
                                onClick={ async () => {
                                    await updateProfile({ coverImg, profileImg })
                                    setCoverImg(null)
                                    setProfileImg(null)
                                }}
                            >
                                {isUpdatingProfile ? <LoadingSpinner size="sm" /> : "Update"}
                            </button>
                        )}
                    </div>

                    {/* USER INFO */}
                    <div className='flex flex-col gap-4 mt-14 px-4'>
                        <div className='flex flex-col'>
                            <span className='font-bold text-lg'>{user?.fullname}</span>
                            <span className='text-sm text-slate-500'>@{user?.username}</span>
                            <span className='text-sm my-1'>{user?.bio}</span>
                        </div>

                        <div className='flex gap-2 flex-wrap'>
                            {user?.link && (
                                <div className='flex gap-1 items-center '>
                                    <FaLink className='w-3 h-3 text-slate-500' />
                                    <a
                                        href={user?.link}
                                        target='_blank'
                                        rel='noreferrer'
                                        className='text-sm text-blue-500 hover:underline'
                                    >
                                        {user?.link}
                                    </a>
                                </div>
                            )}
                            <div className='flex gap-2 items-center'>
                                <IoCalendarOutline className='w-4 h-4 text-slate-500' />
                                <span className='text-sm text-slate-500'>{memberSinceDate}</span>
                            </div>
                        </div>

                        <div className='flex gap-2'>
                            <div className='flex gap-1 items-center'>
                                <span className='font-bold text-xs'>{user?.following.length}</span>
                                <span className='text-slate-500 text-xs'>Following</span>
                            </div>
                            <div className='flex gap-1 items-center'>
                                <span className='font-bold text-xs'>{user?.followers.length}</span>
                                <span className='text-slate-500 text-xs'>Followers</span>
                            </div>
                        </div>
                    </div>

                    {/* POSTS/LIKES SWITCH */}
                    <div className='flex w-full border-b border-gray-700 mt-4'>
                        <div
                            className='flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer'
                            onClick={() => setFeedType("posts")}
                        >
                            Posts
                            {feedType === "posts" && <div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary' />}
                        </div>
                        <div
                            className='flex justify-center flex-1 p-3 text-slate-500 hover:bg-secondary transition duration-300 relative cursor-pointer'
                            onClick={() => setFeedType("likes")}
                        >
                            Likes
                            {feedType === "likes" && <div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary' />}
                        </div>
                    </div>

                    <Posts feedType={feedType} username={username} userId={user?._id} />
                </>
            )}
        </div>
    );
};

export default ProfilePage;
