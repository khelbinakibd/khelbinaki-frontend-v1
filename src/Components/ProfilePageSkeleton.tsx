export function ProfilePageSkeleton() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 min-h-screen animate-pulse">
			{/* Left Sidebar */}
			<div className="p-6 flex flex-col items-center">
				{/* Verified Badge */}
				<div className="mt-6 relative w-full flex justify-start">
					<div className="bg-muted h-5 w-20 rounded" />
				</div>

				{/* Profile Photo */}
				<div className="w-32 h-32 rounded-full bg-muted mt-6" />

				{/* Upload Photo Button */}
				<div className="mt-4 w-full h-10 bg-muted rounded" />

				{/* Change Password */}
				<div className="mt-6 w-full space-y-4">
					<div className="bg-muted h-10 rounded w-full" />
					<div className="bg-muted h-10 rounded w-full" />
					<div className="bg-muted h-10 rounded w-full" />
				</div>
			</div>

			{/* Right Content */}
			<div className="md:col-span-2 border-0 sm:border-l-2 p-6 space-y-6">
				<div className="bg-muted h-6 w-40 rounded" />

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Name */}
					<div className="bg-muted h-10 rounded w-full" />
					{/* Email */}
					<div className="bg-muted h-10 rounded w-full" />
					{/* Address */}
					<div className="col-span-2 space-y-4">
						<div className="bg-muted h-10 rounded w-full" />
						<div className="bg-muted h-10 rounded w-full" />
					</div>
				</div>

				{/* Edit Profile Button */}
				<div className="bg-muted h-10 w-32 rounded mt-6" />
			</div>
		</div>
	);
}
