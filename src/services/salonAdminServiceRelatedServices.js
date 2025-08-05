// import supabase from '../config/supabaseClient.js';;
//
//
// export const handleAddService = async (user_id, serviceDetails) => {
//   const salon_id = await getSalonIdByAdmin(user_id);
//   const {
//     service_name,
//     service_description,
//     service_image_link,
//     price,
//     duration_minutes,
//     service_category,
//     show_price
//   } = serviceDetails;
//
//   const { data, error } = await supabase
//     .from('service')
//     .insert([
//       {
//         salon_id,
//         service_name,
//         service_description,
//         service_image_link,
//         price,
//         duration_minutes,
//         service_category,
//         show_price,
//         is_available: true
//       }
//     ])
//     .select();
//
//   if (error) throw new Error(error.message);
//   return { message: 'Service added', data };
// };
//
//
// export const handleUpdateService = async (user_id, serviceId, serviceDetails) => {
//
//   const salon_id = await getSalonIdByAdmin(user_id);
//   const serviceSalonId = await getServiceSalonId(serviceId);
//   if (salon_id !== serviceSalonId) throw new Error('Unauthorized to update this service');
//   const {
//     service_name,
//     service_description,
//     service_image_link,
//     price,
//     duration_minutes,
//     is_available
//   } = serviceDetails;
//   const { data, error } = await supabase
//     .from('service')
//     .update({
//       service_name,
//       service_description,
//       service_image_link,
//       price,
//       duration_minutes,
//       is_available,
//       updated_at: new Date()
//     })
//     .eq('service_id', serviceId)
//     .select();
//   if (error) throw new Error(error.message);
//   return { message: 'Service updated', data };
// };
//
//
// export const handleDeleteService = async (user_id, service_id) => {
//   const salon_id = await getSalonIdByAdmin(user_id);
//   const serviceSalonId = await getServiceSalonId(service_id);
//
//   if (salon_id !== serviceSalonId) throw new Error('Unauthorized to delete this service');
//
//   const { data, error } = await supabase
//     .from('service')
//     .delete()
//     .eq('service_id', service_id)
//     .select();
//
//   if (error) throw new Error(error.message);
//   return { message: 'Service deleted', data };
// };
//
//
// export const handleUpdateServicePrice = async (user_id, service_id, newPrice) => {
//   const salon_id = await getSalonIdByAdmin(user_id);
//   const serviceSalonId = await getServiceSalonId(service_id);
//
//   if (salon_id !== serviceSalonId) throw new Error('Unauthorized to update price');
//
//   const { data, error } = await supabase
//     .from('service')
//     .update({ price: newPrice, updated_at: new Date() })
//     .eq('service_id', service_id)
//     .select();
//
//   if (error) throw new Error(error.message);
//   return { message: 'Service price updated', data };
// };
//
//
//
// export const handleUpdateServiceDuration = async (user_id, service_id, newDuration) => {
//   // Get the salon ID associated with the given admin user ID
//   const salon_id = await getSalonIdByAdmin(user_id);
//
//   // Get the salon ID associated with the given service ID
//   const serviceSalonId = await getServiceSalonId(service_id);
//
//   // Check if the salon ID of the admin matches the salon ID of the service
//   if (salon_id !== serviceSalonId) throw new Error('Unauthorized to update duration');
//
//   const { data, error } = await supabase
//     .from('service')
//     .update({ duration_minutes: newDuration, updated_at: new Date() })
//     .eq('service_id', service_id)
//     .select();
//
//   if (error) throw new Error(error.message);
//   return { message: 'Service duration updated', data };
// };
//
//
// const getSalonIdByAdmin = async (user_id) => {
//   const { data, error } = await supabase
//     .from('salon')
//     .select('salon_id')
//     .eq('admin_user_id', user_id)
//     .single();
//
//   if (error || !data) throw new Error('Salon not found for this admin');
//   return data.salon_id;
// };
//
// const getServiceSalonId = async (service_id) => {
//   const { data, error } = await supabase
//     .from('service')
//     .select('salon_id')
//     .eq('service_id', service_id)
//     .single();
//
//   if (error || !data) throw new Error('Service not found');
//   return data.salon_id;
// };
//
//
// export const handleGetAllServices = async (user_id) => {
//   const salon_id = await getSalonIdByAdmin(user_id);
//
//   const { data, error } = await supabase
//     .from('service')
//     .select('service_id, service_name, service_description, service_image_link, price, duration_minutes, is_available,service_category,show_price')
//     .eq('salon_id', salon_id);
//
//   if (error) throw new Error(error.message);
//   return data;
// }

import supabase from '../config/supabaseClient.js';;


export const handleAddService = async (user_id, serviceDetails) => {
  const salon_id = await getSalonIdByAdmin(user_id);
  const {
    service_name,
    service_description,
    service_image_link,
    price,
    duration_minutes,
    service_category,
    show_price
  } = serviceDetails;

  const { data, error } = await supabase
      .from('service')
      .insert([
        {
          salon_id,
          service_name,
          service_description,
          service_image_link,
          price,
          duration_minutes,
          service_category,
          show_price,
          is_available: true
        }
      ])
      .select();

  if (error) throw new Error(error.message);
  return { message: 'Service added', data };
};


export const handleUpdateService = async (user_id, serviceId, serviceDetails) => {
  console.log("Now in service" , serviceDetails);
  const salon_id = await getSalonIdByAdmin(user_id);
  const serviceSalonId = await getServiceSalonId(serviceId);
  if (salon_id !== serviceSalonId) throw new Error('Unauthorized to update this service');
  const {
    service_name,
    service_description,
    service_image_link,
    price,
    duration_minutes,
    is_available,
    show_price,
  } = serviceDetails;
  const { data, error } = await supabase
      .from('service')
      .update({
        service_name,
        service_description,
        service_image_link,
        price,
        duration_minutes,
        is_available,
        show_price,
        updated_at: new Date()
      })
      .eq('service_id', serviceId)
      .select();
  if (error) throw new Error(error.message);
  return { message: 'Service updated', data };
};


export const handleDeleteService = async (user_id, service_id) => {
  const salon_id = await getSalonIdByAdmin(user_id);
  const serviceSalonId = await getServiceSalonId(service_id);

  if (salon_id !== serviceSalonId) throw new Error('Unauthorized to delete this service');

  const { data, error } = await supabase
      .from('service')
      .delete()
      .eq('service_id', service_id)
      .select();

  if (error) throw new Error(error.message);
  return { message: 'Service deleted', data };
};


export const handleUpdateServicePrice = async (user_id, service_id, newPrice) => {
  const salon_id = await getSalonIdByAdmin(user_id);
  const serviceSalonId = await getServiceSalonId(service_id);

  if (salon_id !== serviceSalonId) throw new Error('Unauthorized to update price');

  const { data, error } = await supabase
      .from('service')
      .update({ price: newPrice, updated_at: new Date() })
      .eq('service_id', service_id)
      .select();

  if (error) throw new Error(error.message);
  return { message: 'Service price updated', data };
};



export const handleUpdateServiceDuration = async (user_id, service_id, newDuration) => {
  // Get the salon ID associated with the given admin user ID
  const salon_id = await getSalonIdByAdmin(user_id);

  // Get the salon ID associated with the given service ID
  const serviceSalonId = await getServiceSalonId(service_id);

  // Check if the salon ID of the admin matches the salon ID of the service
  if (salon_id !== serviceSalonId) throw new Error('Unauthorized to update duration');

  const { data, error } = await supabase
      .from('service')
      .update({ duration_minutes: newDuration, updated_at: new Date() })
      .eq('service_id', service_id)
      .select();

  if (error) throw new Error(error.message);
  return { message: 'Service duration updated', data };
};


const getSalonIdByAdmin = async (user_id) => {
  const { data, error } = await supabase
      .from('salon')
      .select('salon_id')
      .eq('admin_user_id', user_id)
      .single();

  if (error || !data) throw new Error('Salon not found for this admin');
  return data.salon_id;
};

const getServiceSalonId = async (service_id) => {
  const { data, error } = await supabase
      .from('service')
      .select('salon_id')
      .eq('service_id', service_id)
      .single();

  if (error || !data) throw new Error('Service not found');
  return data.salon_id;
};


export const handleGetAllServices = async (user_id) => {
  const salon_id = await getSalonIdByAdmin(user_id);

  const { data, error } = await supabase
      .from('service')
      .select('service_id, service_name, service_description, service_image_link, price, duration_minutes, is_available,service_category,show_price')
      .eq('salon_id', salon_id);

  if (error) throw new Error(error.message);
  return data;
}