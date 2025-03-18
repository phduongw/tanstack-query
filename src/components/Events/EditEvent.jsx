import {Link, useNavigate, useParams} from 'react-router-dom';
import {useMutation, useQuery} from "@tanstack/react-query";

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { fetchEvent, updateEvent, queryClient } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data, isPending, isError, error } = useQuery({
        queryKey: ['events', id],
        queryFn: ({ signal }) => fetchEvent({ id, signal }),
        staleTime: 5000
    });

    const { mutate } = useMutation({
        mutationFn: ({ event }) => {
            return updateEvent({ id, event });
        },
        onMutate: async ({ event }) => {
            await queryClient.cancelQueries({ queryKey: ['events', id] }); //Cancel the queries if they are running
            const preData = queryClient.getQueryData(['events', id]); //Get the cached data by queryKey
            queryClient.setQueryData(['events', id], event); //To replace the cached data and display on screen before the mutationFN done

            return {
                preData,
            }; //The returned value here will be a context (Third 3 param on the function of onError field below. It exactly is context variable below)
        },// This field will execute before the mutationFN execute
        onError: (error, data, context) => {
            queryClient.setQueryData(['events', id], context.preData);
        }, // This field will execute if the mutation failed.
        onSettled: () => {
            queryClient.invalidateQueries(['events', id]);
        } // This field will always execute, no matter the mutation fail or success
    });

    function handleSubmit(formData) {
        mutate({ event: formData });
        navigate('../');
    }

    function handleClose() {
        navigate('../');
    }

    let content;
    if (isPending) {
        content = <div className="center">
            <LoadingIndicator />
        </div>;
    }

    if (isError) {
        content = <>
            <ErrorBlock
                title="Failed to load event"
                message={error.info?.message || 'Failed to fetch events.'}
            />
            <div className="form-actions">
                <Link to="../" className="button">
                    Okay
                </Link>

            </div>
        </>;
    }

    if (data) {
        content = <EventForm inputData={ data } onSubmit={ handleSubmit }>
            <Link to="../" className="button-text">
                Cancel
            </Link>
            <button type="submit" className="button">
                Update
            </button>
        </EventForm>;
    }

    return (
        <Modal onClose={handleClose}>
            { content }
        </Modal>
    );
}
