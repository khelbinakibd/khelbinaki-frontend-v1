export function TurfCardSkeleton() {
	return (
		<div className="flex flex-col bg-white shadow-lg rounded-xl overflow-hidden animate-pulse">
			{/* Image */}
			<div className="bg-muted h-48 md:h-56 w-full rounded-t-xl" />

			{/* Content */}
			<div className="p-4 flex flex-col grow space-y-3">
				<div className="bg-muted h-5 rounded w-3/4" />
				<div className="bg-muted h-4 rounded w-1/2" />

				<div className="flex flex-wrap gap-2 mt-2">
					<div className="bg-muted h-5 rounded-full w-16" />
					<div className="bg-muted h-5 rounded-full w-20" />
					<div className="bg-muted h-5 rounded-full w-12" />
				</div>
			</div>

			{/* Footer */}
			<div className="flex justify-between items-center p-4">
				<div className="bg-muted h-5 rounded w-12" />
				<div className="bg-muted h-8 rounded w-24" />
			</div>
		</div>
	);
}